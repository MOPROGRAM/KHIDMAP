import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const verifications = await prisma.verification.findMany();
    return NextResponse.json(verifications);
  } catch (err: any) {
    logger.error(`Error fetching verifications: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching verifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const verification = await prisma.verification.create({ data: await req.json() });
    return NextResponse.json(verification, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating verification: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating verification' }, { status: 500 });
  }
}