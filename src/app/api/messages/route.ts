import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const messages = await prisma.message.findMany();
    return NextResponse.json(messages);
  } catch (err: any) {
    logger.error(`Error fetching messages: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const message = await prisma.message.create({ data: await req.json() });
    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating message: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating message' }, { status: 500 });
  }
}