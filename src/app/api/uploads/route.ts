import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import logger from '@/lib/logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function bufferToStream(buffer: Buffer): Promise<Readable> {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but can be a no-op
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = await bufferToStream(buffer);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({ message: 'File uploaded successfully', url: uploadResult.secure_url, public_id: uploadResult.public_id }, { status: 201 });
  } catch (err: any) {
    logger.error(`File upload error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json({ message: 'Public ID is required' }, { status: 400 });
    }

    const destroyResult = await cloudinary.uploader.destroy(publicId);

    if (destroyResult.result === 'ok') {
      return NextResponse.json({ message: 'File deleted successfully' });
    } else {
      logger.error(`Cloudinary deletion error: ${destroyResult.result}`);
      return NextResponse.json({ message: `Error deleting file: ${destroyResult.result}` }, { status: 500 });
    }
  } catch (err: any) {
    logger.error(`File deletion error: ${err.message}\nStack: ${err.stack}`);
    return NextResponse.json({ message: 'Error deleting file' }, { status: 500 });
  }
}