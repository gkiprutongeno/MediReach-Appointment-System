import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialState = {
  firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  phone: '', role: 'patient',
  doctorInfo: { specialization: '', licenseNumber: '', consultationFee: '', experience: '', bio: '' }
};

export default function Register() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({}); // ✅ Track field-specific errors
  const [generalError, setGeneralError] = useState(''); // ✅ Track general errors
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * ✅ Client-side validation function
   * Validates all form fields before sending to backend
   * Returns object with field names as keys and error messages as values
   */
  const validateForm = () => {
    const newErrors = {};

    // ✅ First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // ✅ Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // ✅ Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // ✅ Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password should contain uppercase letter and number';
    }

    // ✅ Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // ✅ Phone validation (optional but validate format if provided)
    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ✅ Doctor-specific validation
    if (formData.role === 'doctor') {
      if (!formData.doctorInfo.specialization) {
        newErrors.specialization = 'Specialization is required for doctors';
      }
      if (!formData.doctorInfo.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required for doctors';
      }
      if (!formData.doctorInfo.consultationFee || isNaN(formData.doctorInfo.consultationFee) || formData.doctorInfo.consultationFee < 0) {
        newErrors.consultationFee = 'Valid consultation fee is required';
      }
    }

    console.log('📋 [FRONTEND VALIDATION]', newErrors.length ? newErrors : 'All validations passed ✅');
    return newErrors;
  };

  /**
   * ✅ Handle form field changes
   * Updates state and clears field error when user starts typing
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('doctor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        doctorInfo: { ...prev.doctorInfo, [field]: value }
      }));
      // ✅ Clear field error when user corrects it
      setErrors(prev => ({ ...prev, [field]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // ✅ Clear field error when user corrects it
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // ✅ Clear general error when user modifies form
    setGeneralError('');
  };

  /**
   * ✅ Handle form submission
   * Validates on client, then sends to backend with logging
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Clear previous errors
    setErrors({});
    setGeneralError('');
    setLoading(true);

    // ✅ Validate on client side
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log('❌ [FRONTEND] Validation failed:', validationErrors);
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // ✅ Log payload being sent (without password for security)
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: formData.role
      };

      if (formData.role === 'doctor') {
        payload.doctorInfo = {
          specialization: formData.doctorInfo.specialization,
          licenseNumber: formData.doctorInfo.licenseNumber.trim(),
          consultationFee: Number(formData.doctorInfo.consultationFee),
          experience: Number(formData.doctorInfo.experience) || 0,
          bio: formData.doctorInfo.bio.trim() || ''
        };
      }

      console.log('📤 [FRONTEND] Sending registration payload:', {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        role: payload.role,
        doctorInfo: payload.doctorInfo,
        timestamp: new Date().toISOString()
      });

      // ✅ Call backend
      await register(payload);
      console.log('✅ [FRONTEND] Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      // ✅ Log and display backend errors
      console.error('❌ [FRONTEND] Registration failed:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });

      // Parse error response from backend
      const errorData = err.response?.data;
      if (errorData?.details && Array.isArray(errorData.details)) {
        // ✅ Multiple validation errors from backend
        setGeneralError('Please fix the following issues:');
        const fieldErrors = {};
        errorData.details.forEach(detail => {
          // Try to extract field name from error message
          if (detail.includes('First name')) fieldErrors.firstName = detail;
          else if (detail.includes('Last name')) fieldErrors.lastName = detail;
          else if (detail.includes('Email')) fieldErrors.email = detail;
          else if (detail.includes('Password')) fieldErrors.password = detail;
          else if (detail.includes('specialization')) fieldErrors.specialization = detail;
          else if (detail.includes('license')) fieldErrors.licenseNumber = detail;
          else if (detail.includes('consultation')) fieldErrors.consultationFee = detail;
          else fieldErrors.general = detail;
        });
        setErrors(fieldErrors);
      } else if (errorData?.field) {
        // ✅ Single field error (like duplicate email/license)
        const errorMsg = errorData.error || 'An error occurred';
        setGeneralError(errorMsg);
        setErrors({ [errorData.field]: errorMsg });
      } else {
        // ✅ Generic error
        setGeneralError(errorData?.error || err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join MediReach to manage your healthcare</p>
        </div>

        {/* ✅ Display general errors */}
        {generalError && (
          <div className="alert alert-error" role="alert">
            <strong>⚠️ Error:</strong> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* First Name & Last Name Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange} 
                required 
                placeholder="John"
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="error-text">❌ {errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange} 
                required 
                placeholder="Doe"
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="error-text">❌ {errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange} 
              required 
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">❌ {errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange} 
              placeholder="(555) 123-4567"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-text">❌ {errors.phone}</span>}
          </div>

          {/* Password & Confirm Password Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password}
                onChange={handleChange} 
                required 
                minLength={8} 
                placeholder="Min 8 characters (with uppercase & number)"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error-text">❌ {errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">❌ {errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>I am a:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="role" 
                  value="patient"
                  checked={formData.role === 'patient'} 
                  onChange={handleChange} 
                />
                <span>Patient</span>
              </label>
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="role" 
                  value="doctor"
                  checked={formData.role === 'doctor'} 
                  onChange={handleChange} 
                />
                <span>Doctor</span>
              </label>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {formData.role === 'doctor' && (
            <div className="doctor-fields">
              <h3>Doctor Information</h3>
              
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <select 
                  id="specialization" 
                  name="doctor.specialization"
                  value={formData.doctorInfo.specialization} 
                  onChange={handleChange} 
                  required
                  className={errors.specialization ? 'input-error' : ''}
                >
                  <option value="">Select specialization</option>
                  <option value="general-practice">General Practice</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="neurology">Neurology</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="dentistry">Dentistry</option>
                </select>
                {errors.specialization && <span className="error-text">❌ {errors.specialization}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number</label>
                  <input 
                    type="text" 
                    id="licenseNumber" 
                    name="doctor.licenseNumber"
                    value={formData.doctorInfo.licenseNumber} 
                    onChange={handleChange} 
                    required
                    placeholder="MD12345"
                    className={errors.licenseNumber ? 'input-error' : ''}
                  />
                  {errors.licenseNumber && <span className="error-text">❌ {errors.licenseNumber}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="consultationFee">Consultation Fee ($)</label>
                  <input 
                    type="number" 
                    id="consultationFee" 
                    name="doctor.consultationFee"
                    value={formData.doctorInfo.consultationFee} 
                    onChange={handleChange} 
                    required 
                    min="0" 
                    placeholder="100"
                    className={errors.consultationFee ? 'input-error' : ''}
                  />
                  {errors.consultationFee && <span className="error-text">❌ {errors.consultationFee}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input 
                    type="number" 
                    id="experience" 
                    name="doctor.experience"
                    value={formData.doctorInfo.experience} 
                    onChange={handleChange} 
                    min="0" 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Professional Bio</label>
                <textarea 
                  id="bio" 
                  name="doctor.bio"
                  value={formData.doctorInfo.bio} 
                  onChange={handleChange} 
                  placeholder="Write a brief professional bio..."
                  rows="3"
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
          >
            {loading ? '⏳ Creating Account...' : '✅ Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>

      <style>{`
        .input-error {
          border-color: #dc3545 !important;
          background-color: rgba(220, 53, 69, 0.05);
        }
        
        .error-text {
          display: block;
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 4px;
          font-weight: 500;
        }
        
        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .alert-error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}
