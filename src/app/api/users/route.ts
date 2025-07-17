import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const userRole = req.headers.get('x-user-role');

    if (userRole !== 'admin') {
      logger.warn(`Unauthorized access attempt to /api/users by role: ${userRole}`);
      return NextResponse.json({ message: 'الوصول مرفوض. صلاحيات المسؤول مطلوبة.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (err: any) {
    logger.error(`Error fetching users: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.create({ data: await req.json() });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating user: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
  }
}