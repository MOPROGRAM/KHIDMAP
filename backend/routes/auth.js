
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import logger from '../logger.js';
import prisma from '../prismaClient.js';

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
    logger.info(`Registration attempt for email: ${email}`);
    if (!name || !email || !password || !role) {
      logger.info('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'جميع الحقول مطلوبة.' });
    }
    // تحقق من عدم وجود المستخدم مسبقاً
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logger.info(`Registration failed: Email already in use - ${email}`);
      return res.status(409).json({ message: 'البريد الإلكتروني مستخدم بالفعل.' });
    }
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    // إنشاء رمز تحقق
    const verificationToken = crypto.randomBytes(32).toString('hex');
    logger.info('Before creating user in database');
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isVerified: false,
          verificationToken,
        }
      });
    } catch (createError) {
      logger.error(`Error creating user in database: ${JSON.stringify(createError, Object.getOwnPropertyNames(createError))}`);
      throw createError;
    }
    logger.info('User created successfully in database');
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;
    // Mock email sending for testing
    logger.info(`Mock send email to ${email} with verification link: ${verifyUrl}`);
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'تأكيد البريد الإلكتروني',
    //   html: `<p>مرحباً ${name}،</p><p>يرجى تأكيد بريدك الإلكتروني عبر الضغط على الرابط التالي:</p><a href="${verifyUrl}">${verifyUrl}</a>`
    // });
    logger.info(`Registration successful for email: ${email}`);
    console.log('Sending registration success response');
    res.status(201).json({ message: 'تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني.' });
  } catch (err) {
    logger.error(`Registration error: ${err.message}\nStack: ${err.stack}`);
    const sanitizedMessage = err.message.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    res.status(500).json({ message: 'حدث خطأ أثناء التسجيل.', error: sanitizedMessage });
  }
});

// تفعيل الحساب عبر رمز التحقق
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ message: 'رمز التحقق غير صالح.' });
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });
    res.json({ message: 'تم تفعيل الحساب بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ أثناء التحقق.' });
  }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);
    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة.' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'يرجى تفعيل حسابك أولاً.' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'بيانات الاعتماد غير صحيحة.' });
    }
    // تسجيل الدخول ناجح - يمكن إنشاء جلسة أو JWT هنا
    res.json({ message: 'تم تسجيل الدخول بنجاح.' });
  } catch (err) {
    logger.error(`Login error: ${err.message}\nStack: ${err.stack}`);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول.' });
  }
});

export default router;
