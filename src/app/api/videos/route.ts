import { NextRequest, NextResponse } from 'next/server';
import { classifyVideoContent } from '@/ai/flows/classify-video-content';
import type { Video } from '@/lib/types';
import path from 'path';
import fs from 'fs/promises';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// --- GET: Fetch all videos from MongoDB ---
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const videos = await db
      .collection<Video>('videos')
      .find()
      .sort({ uploadDate: -1 })
      .toArray();

    // Map _id to id for client-side consistency
    const formattedVideos = videos.map(video => ({
        ...video,
        id: video._id.toString(),
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ message: 'Failed to fetch videos' }, { status: 500 });
  }
}

// --- POST: Add a new video ---
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'free' | 'paid';
    const videoFile = formData.get('videoFile') as File | null;

    if (!videoFile || !title || !description || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- File Storage Logic ---
    const videoStoragePath = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await fs.mkdir(videoStoragePath, { recursive: true }); 
    
    const uniqueFilename = `${Date.now()}-${videoFile.name}`;
    const filePath = path.join(videoStoragePath, uniqueFilename);
    const fileUrl = `/uploads/videos/${uniqueFilename}`; 

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    console.log(`Video saved to: ${filePath}`);
    
    // --- AI Classification ---
    const classification = await classifyVideoContent({ title, description });

    const newVideo: Omit<Video, 'id' | '_id'> = {
      title,
      description,
      type,
      category: classification.category,
      src: fileUrl, 
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450`,
      views: 0,
      uploadDate: new Date().toISOString(),
    };

    // --- Database Logic ---
    const { db } = await connectToDatabase();
    const result = await db.collection('videos').insertOne(newVideo);
    
    const createdVideo = {
        ...newVideo,
        id: result.insertedId.toString(),
    }

    return NextResponse.json(createdVideo, { status: 201 });

  } catch (error) {
    console.error('Error adding video:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Failed to add video: ${errorMessage}` }, { status: 500 });
  }
}
