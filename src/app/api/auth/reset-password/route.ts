import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import logger from '@/lib/logger';
import prisma from '@/lib/prismaClient';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ message: 'الرمز وكلمة المرور الجديدة مطلوبان.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Check if the token has not expired
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'الرمز غير صالح أو منتهي الصلاحية.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح.' });
  } catch (err: any) {
    logger.error(`Reset password error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' }, { status: 500 });
  }
}