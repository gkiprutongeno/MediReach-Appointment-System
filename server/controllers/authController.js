const User = require('../models/User');
const Doctor = require('../models/Doctor');

/**
 * REGISTER - Create a new user account (patient or doctor)
 * 
 * Required fields:
 * - firstName, lastName, email, password
 * - role (patient|doctor)
 * 
 * If role === 'doctor', also required:
 * - doctorInfo.specialization
 * - doctorInfo.licenseNumber
 * - doctorInfo.consultationFee
 */
exports.register = async (req, res, next) => {
  try {
    // Log incoming request (without password for security)
    console.log('📝 [REGISTER] Incoming payload:', {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      doctorInfo: req.body.doctorInfo,
      timestamp: new Date().toISOString()
    });

    // ✅ STEP 1: Validate required fields
    const { email, password, firstName, lastName, phone, role, doctorInfo } = req.body;
    const errors = [];

    // Basic validation
    if (!firstName?.trim()) errors.push('First name is required');
    if (!lastName?.trim()) errors.push('Last name is required');
    if (!email?.trim()) errors.push('Email is required');
    if (!password?.trim()) errors.push('Password is required');
    if (!role || !['patient', 'doctor'].includes(role)) errors.push('Role must be "patient" or "doctor"');

    // Email format validation
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email format');

    // Password strength validation
    if (password && password.length < 8) errors.push('Password must be at least 8 characters');

    // Doctor-specific validation
    if (role === 'doctor') {
      if (!doctorInfo?.specialization) errors.push('Doctor specialization is required');
      if (!doctorInfo?.licenseNumber) errors.push('Doctor license number is required');
      if (!doctorInfo?.consultationFee || isNaN(doctorInfo.consultationFee) || doctorInfo.consultationFee < 0) {
        errors.push('Valid consultation fee is required (must be a positive number)');
      }
    }

    // Return validation errors
    if (errors.length > 0) {
      console.log('❌ [REGISTER] Validation failed:', errors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors, // Return array of specific errors
        timestamp: new Date().toISOString()
      });
    }

    // ✅ STEP 2: Check for duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('❌ [REGISTER] Email already exists:', email);
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
        field: 'email',
        timestamp: new Date().toISOString()
      });
    }

    // ✅ STEP 3: Check for duplicate license number if doctor
    if (role === 'doctor') {
      const existingLicense = await Doctor.findOne({ licenseNumber: doctorInfo.licenseNumber });
      if (existingLicense) {
        console.log('❌ [REGISTER] License number already exists:', doctorInfo.licenseNumber);
        return res.status(400).json({
          success: false,
          error: 'License number already registered',
          field: 'licenseNumber',
          timestamp: new Date().toISOString()
        });
      }
    }

    // ✅ STEP 4: Create User account
    console.log('✏️ [REGISTER] Creating user account for:', email);
    
    // ✅ Auto-generate username from email if not provided
    // Extract the part before @ and make it username-friendly
    let username = req.body.username;
    if (!username) {
      // Generate from email: john@gmail.com → john_12345
      const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const randomSuffix = Math.floor(Math.random() * 100000);
      username = `${emailPrefix}_${randomSuffix}`;
    }
    
    const user = await User.create({
      username, // ✅ Include auto-generated username
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || undefined,
      role: role === 'doctor' ? 'doctor' : 'patient'
    });
    console.log('✅ [REGISTER] User created:', user._id);

    // ✅ STEP 5: Create Doctor profile if applicable
    if (role === 'doctor' && doctorInfo) {
      console.log('✏️ [REGISTER] Creating doctor profile for user:', user._id);
      const doctor = await Doctor.create({
        user: user._id,
        specialization: doctorInfo.specialization,
        licenseNumber: doctorInfo.licenseNumber,
        consultationFee: Number(doctorInfo.consultationFee),
        experience: doctorInfo.experience || 0,
        bio: doctorInfo.bio || '',
        languages: doctorInfo.languages || ['English']
      });
      console.log('✅ [REGISTER] Doctor profile created:', doctor._id);
    }

    // ✅ STEP 6: Generate JWT token
    const token = user.generateToken();

    // ✅ STEP 7: Return success response
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: `${user.firstName} ${user.lastName}`
      },
      message: `Welcome ${user.firstName}! Your account has been created successfully.`,
      timestamp: new Date().toISOString()
    };

    console.log('✅ [REGISTER] Registration successful for:', email);
    res.status(201).json(responseData);

  } catch (err) {
    // ❌ Handle unexpected errors
    console.error('❌ [REGISTER] Unexpected error:', {
      message: err.message,
      code: err.code,
      field: err.path, // For Mongoose validation errors
      value: err.value, // For Mongoose validation errors
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details,
        timestamp: new Date().toISOString()
      });
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      return res.status(400).json({
        success: false,
        error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        field,
        value,
        timestamp: new Date().toISOString()
      });
    }

    // Pass to error handler middleware
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) return res.status(401).json({ success: false, error: 'Account is deactivated' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let doctorProfile = null;
    if (user.role === 'doctor') doctorProfile = await Doctor.findOne({ user: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        ...(doctorProfile && { doctorProfile })
      }
    });
  } catch (err) {
    next(err);
  }
};
