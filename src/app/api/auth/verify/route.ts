import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import prisma from '@/lib/prismaClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'رمز التحقق غير صالح.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) {
      return NextResponse.json({ message: 'رمز التحقق غير صالح.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });

    return NextResponse.json({ message: 'تم تفعيل الحساب بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err: any) {
    logger.error(`Verification error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'حدث خطأ أثناء التحقق.' }, { status: 500 });
  }
}