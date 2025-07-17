import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany();
    return NextResponse.json(disputes);
  } catch (err: any) {
    logger.error(`Error fetching disputes: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching disputes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const dispute = await prisma.dispute.create({ data: await req.json() });
    return NextResponse.json(dispute, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating dispute: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating dispute' }, { status: 500 });
  }
}