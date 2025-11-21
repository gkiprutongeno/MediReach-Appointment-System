const User = require('../models/User');

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'phone', 'dateOfBirth',
      'gender', 'address', 'profileImage'
    ];

    const updates = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, error: 'Please provide current and new password' });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();
    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// Get users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, count: users.length, total, pages: Math.ceil(total / limit), data: users });
  } catch (err) {
    next(err);
  }
};

// Activate / deactivate user
exports.updateStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
