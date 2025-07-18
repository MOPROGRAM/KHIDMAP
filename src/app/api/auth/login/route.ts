import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import logger from '@/lib/logger';
import prisma from '@/lib/prismaClient';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    logger.info(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return NextResponse.json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'بيانات الاعتماد غير صحيحة.' }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: 'يرجى تفعيل حسابك أولاً.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'بيانات الاعتماد غير صحيحة.' }, { status: 401 });
    }

    // إنشاء توكن JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err: any) {
    logger.error(`Login error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'حدث خطأ أثناء تسجيل الدخول.' }, { status: 500 });
  }
}