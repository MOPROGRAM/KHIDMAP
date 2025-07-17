import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';
import logger from '@/lib/logger';

export async function GET() {
  try {
    const ads = await prisma.ad.findMany();
    return NextResponse.json(ads);
  } catch (err: any) {
    logger.error(`Error fetching ads: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error fetching ads' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ad = await prisma.ad.create({ data: await req.json() });
    return NextResponse.json(ad, { status: 201 });
  } catch (err: any) {
    logger.error(`Error creating ad: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error creating ad' }, { status: 500 });
  }
}