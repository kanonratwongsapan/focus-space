import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      isSetupCompleted: true
    });

    const savedUser = await User.create(newUser);
    
    // Generate Token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'focus_space_super_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        isSetupCompleted: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account with this email has been registered.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'focus_space_super_secret_key_12345',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        googleClientId: user.googleClientId,
        isSetupCompleted: user.isSetupCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile Route
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userObj = user.toObject();
    if (userObj.isSetupCompleted === undefined) {
      userObj.isSetupCompleted = true;
    }
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile Route
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, profileImage, googleClientId } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
      user.username = username;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    if (googleClientId !== undefined) {
      user.googleClientId = googleClientId;
    }

    user.isSetupCompleted = true;

    const updatedUser = await user.save();
    
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      googleClientId: updatedUser.googleClientId,
      isSetupCompleted: updatedUser.isSetupCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET global config (such as developer googleClientId)
router.get('/config', async (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// POST verify google token and sign-in or register user
router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google ID Token is required.' });
    }

    const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!tokenRes.ok) {
      return res.status(400).json({ message: 'Google authentication failed.' });
    }

    const payload = await tokenRes.json();
    const { email, name, picture } = payload;

    // Enforce University Email Restriction (@rmuti.ac.th)
    if (!email || !email.toLowerCase().endsWith('@rmuti.ac.th')) {
      return res.status(400).json({ 
        message: 'ระบบรองรับเฉพาะอีเมลสถาบัน (@rmuti.ac.th) เท่านั้น กรุณาใช้อีเมลสถาบันเพื่อเข้าสู่ระบบค่ะ 🌸' 
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user with a strong hashed random password
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        username: name || email.split('@')[0],
        email,
        password: hashedPassword,
        profileImage: 'astronaut',
        googleClientId: process.env.GOOGLE_CLIENT_ID || ''
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'focus_space_super_secret_key_12345', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        googleClientId: user.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
        isSetupCompleted: user.isSetupCompleted === undefined ? true : user.isSetupCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login/Register using Google Access Token (which has calendar scopes)
router.post('/google-oauth-login', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Access Token is required.' });
    }

    const profileRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!profileRes.ok) {
      return res.status(400).json({ message: 'Google OAuth token verification failed.' });
    }

    const payload = await profileRes.json();
    const { email, name, picture } = payload;

    // Enforce University Email Restriction (@rmuti.ac.th) as instructed by Advisor
    if (!email || !email.toLowerCase().endsWith('@rmuti.ac.th')) {
      return res.status(400).json({ 
        message: 'ระบบรองรับเฉพาะอีเมลสถาบัน (@rmuti.ac.th) เท่านั้น กรุณาใช้อีเมลสถาบันเพื่อเข้าสู่ระบบค่ะ 🌸' 
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        username: name || email.split('@')[0],
        email,
        password: hashedPassword,
        profileImage: 'astronaut',
        googleClientId: process.env.GOOGLE_CLIENT_ID || ''
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'focus_space_super_secret_key_12345', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        googleClientId: user.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
        isSetupCompleted: user.isSetupCompleted === undefined ? true : user.isSetupCompleted
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 1: Request Security Reset OTP Code
router.post('/request-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลที่ใช้ลงทะเบียนค่ะ' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้งานที่ใช้อีเมลนี้ในระบบค่ะ' });
    }

    // Generate 6-digit random security OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes valid
    await user.save();

    res.json({
      message: 'ออกรหัสยืนยันความปลอดภัยสำเร็จแล้วค่ะ',
      verificationCode: resetCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify Security Reset OTP Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วนค่ะ' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้ในระบบค่ะ' });
    }

    if (!user.resetCode || user.resetCode !== code.trim()) {
      return res.status(400).json({ message: 'รหัสยืนยันความปลอดภัยไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งนะคะ' });
    }

    if (!user.resetCodeExpires || new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: 'รหัสยืนยันความปลอดภัยนี้หมดอายุแล้ว (10 นาที) กรุณากดขอรหัสใหม่นะคะ' });
    }

    res.json({
      message: 'ยืนยันรหัสความปลอดภัยสำเร็จแล้วค่ะ',
      verified: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 3: Set New Password after verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วนค่ะ' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษรค่ะ' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบบัญชีผู้ใช้ในระบบค่ะ' });
    }

    if (!user.resetCode || user.resetCode !== code.trim()) {
      return res.status(400).json({ message: 'รหัสยืนยันความปลอดภัยไม่ถูกต้องค่ะ' });
    }

    if (!user.resetCodeExpires || new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: 'รหัสยืนยันความปลอดภัยนี้หมดอายุแล้วค่ะ' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = '';
    user.resetCodeExpires = null;
    await user.save();

    res.json({
      message: 'ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้วค่ะ! สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
