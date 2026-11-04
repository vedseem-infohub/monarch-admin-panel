import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dirkawqb8',
  api_key: process.env.CLOUDINARY_API_KEY || '382522882222572',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'JxBmIIsrGMmMj_cih3-iNDsFCzg',
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data (Device file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files: File[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No file received from device' },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: 'monarch',
          resource_type: 'auto',
        });

        if (uploadResult?.secure_url) {
          uploadedUrls.push(uploadResult.secure_url);
        }
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
        count: uploadedUrls.length,
        message: `${uploadedUrls.length} image(s) uploaded to Cloudinary successfully`,
      });
    }

    // Handle JSON payload (base64 or image url)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const images: string[] = [];

      if (body.image && typeof body.image === 'string') {
        images.push(body.image);
      } else if (Array.isArray(body.images)) {
        images.push(...body.images.filter((img: unknown) => typeof img === 'string'));
      }

      if (images.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No image data provided in JSON' },
          { status: 400 }
        );
      }

      const uploadedUrls: string[] = [];
      for (const img of images) {
        const uploadResult = await cloudinary.uploader.upload(img, {
          folder: 'monarch',
          resource_type: 'auto',
        });
        if (uploadResult?.secure_url) {
          uploadedUrls.push(uploadResult.secure_url);
        }
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
        count: uploadedUrls.length,
        message: 'Image uploaded to Cloudinary successfully',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Unsupported Content-Type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Admin Cloudinary API upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Cloudinary upload failed: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

