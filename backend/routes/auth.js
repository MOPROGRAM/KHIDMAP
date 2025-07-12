import express from 'express';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
const router = express.Router();

// إعداد nodemailer (يمكنك تعديل الإعدادات حسب مزود البريد)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة.' });
    }
    // تحقق من عدم وجود المستخدم مسبقاً
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'البريد الإلكتروني مستخدم بالفعل.' });
    }
    // إنشاء رمز تحقق
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // حفظ المستخدم
    const user = new User({
      name,
      email,
      password, // يجب تشفير كلمة المرور في الإنتاج
      role,
      isVerified: false,
      verificationToken,
    });
    await user.save();
    // إرسال إيميل التحقق
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'تأكيد البريد الإلكتروني',
      html: `<p>مرحباً ${name}،</p><p>يرجى تأكيد بريدك الإلكتروني عبر الضغط على الرابط التالي:</p><a href="${verifyUrl}">${verifyUrl}</a>`
    });
    res.status(201).json({ message: 'تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ أثناء التسجيل.' });
  }
});

// تفعيل الحساب عبر رمز التحقق
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'رمز التحقق غير صالح.' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'تم تفعيل الحساب بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء التحقق.' });
  }
});

export default router;
