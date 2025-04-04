const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { handleUpload } = require('../middleware/uploadMiddleware');

// 🛡 Generate access token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// 📌 Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role: 'user', isVerified: false });

    const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: 'Verification email sent', user: { _id: user._id, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Verify email
const verifyEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Login
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    message: 'Login successful',
    token: accessToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

// ✅ Refresh Token
const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// ✅ Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Profile
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password && updates.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete account
const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Upload avatar
const uploadProfilePicture = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  const filePath = '/uploads/profile/' + path.basename(req.file.filepath);
  const user = await User.findByIdAndUpdate(req.user.id, { avatar: filePath }, { new: true });
  res.json({ message: 'Avatar uploaded', user });
};

// ✅ Export semua
module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  deleteAccount,
  uploadProfilePicture
};
