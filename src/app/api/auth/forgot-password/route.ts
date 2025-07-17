import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logger from '@/lib/logger';
import prisma from '@/lib/prismaClient';

// إعداد nodemailer (يمكنك تعديل الإعدادات حسب مزود البريد)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // لا تكشف ما إذا كان البريد الإلكتروني موجودًا أم لا لأسباب أمنية
      return NextResponse.json({ message: 'إذا كان بريدك الإلكتروني مسجلاً، فستتلقى رابطًا لإعادة التعيين.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // صالح لمدة ساعة واحدة

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `<p>لقد طلبت إعادة تعيين كلمة المرور. اضغط على الرابط التالي لإعادة تعيينها:</p><a href="${resetUrl}">${resetUrl}</a><p>إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني.</p>`,
    });

    return NextResponse.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' });
  } catch (err: any) {
    logger.error(`Forgot password error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'حدث خطأ ما.' }, { status: 500 });
  }
}