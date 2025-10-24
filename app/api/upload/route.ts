import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM, MOV)' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN not configured');
      return NextResponse.json(
        { 
          error: 'File upload not configured. Please set up Vercel Blob Storage in your Vercel dashboard.',
          details: 'Missing BLOB_READ_WRITE_TOKEN environment variable'
        },
        { status: 503 }
      );
    }

    try {
      // Upload to Vercel Blob
      const blob = await put(file.name, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Determine media type
      const mediaType = validImageTypes.includes(file.type) ? 'photo' : 'video';

      return NextResponse.json({
        url: blob.url,
        mediaType,
        size: file.size,
        name: file.name,
      });
    } catch (blobError) {
      console.error('Vercel Blob error:', blobError);
      return NextResponse.json(
        { 
          error: 'Failed to upload to storage',
          details: blobError instanceof Error ? blobError.message : 'Unknown blob storage error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

