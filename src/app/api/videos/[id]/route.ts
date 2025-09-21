import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

async function getVideoOr404(db: any, id: string) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });
    return video;
}


// --- GET: Fetch a single video by ID ---
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const video = await getVideoOr404(db, params.id);

    if (!video) {
      return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ ...video, id: video._id.toString() });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json({ message: 'Failed to fetch video' }, { status: 500 });
  }
}

// --- PUT: Update a video's metadata ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const video = await getVideoOr404(db, params.id);

    if (!video) {
        return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    const data = await request.json();
    const updateData: { [key: string]: any } = {};

    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    await db.collection('videos').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateData }
    );
    
    return NextResponse.json({ message: `Video ${params.id} updated successfully.` });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json({ message: 'Failed to update video' }, { status: 500 });
  }
}

// --- DELETE: Remove a video from DB and filesystem ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    try {
        const { db } = await connectToDatabase();
        const video = await getVideoOr404(db, params.id);

        if (!video) {
            return NextResponse.json({ message: 'Video not found' }, { status: 404 });
        }

        // 1. Delete the file from the filesystem
        if (video.src) {
            const filePath = path.join(process.cwd(), 'public', video.src);
            try {
                await fs.unlink(filePath);
                console.log(`Deleted video file: ${filePath}`);
            } catch (fileError) {
                // If file doesn't exist, we can still proceed to delete DB record
                console.error(`Could not delete file ${filePath}:`, fileError);
            }
        }
        
        // 2. Delete the record from the database
        await db.collection('videos').deleteOne({ _id: new ObjectId(params.id) });

        return NextResponse.json({ message: `Video ${params.id} deleted successfully.` });

    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json({ message: 'Failed to delete video' }, { status: 500 });
    }
}
