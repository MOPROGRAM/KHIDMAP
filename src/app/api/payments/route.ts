import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany();
    return NextResponse.json(payments);
  } catch (err: any) {
    logger.error(`Error fetching payments: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payment = await prisma.payment.create({ data: await req.json() });
    return NextResponse.json(payment, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating payment: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating payment' }, { status: 500 });
  }
}