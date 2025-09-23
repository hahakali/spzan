
'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import type { Video } from '@/lib/types';
import path from 'path';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';

export async function getVideos(): Promise<Video[]> {
  try {
    const { db } = await connectToDatabase();
    const videos = await db
      .collection('videos')
      .find()
      .sort({ uploadDate: -1 })
      .toArray();

    // The _id from mongodb needs to be converted to a string for client-side use
    const formattedVideos = videos.map(video => ({
        ...video,
        id: video._id.toString(),
        _id: undefined, // Remove the ObjectId from the client-side object
    })) as unknown as Video[];
    
    return formattedVideos;
  } catch (error) {
    console.error("Action: getVideos fetch error:", error);
    return [];
  }
};

export async function getVideoById(id: string): Promise<Video | undefined> {
   try {
    if (!ObjectId.isValid(id)) {
      console.error(`Action: Invalid ObjectId: ${id}`);
      return undefined;
    }
    const { db } = await connectToDatabase();
    const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });
    
    if (!video) {
      return undefined;
    }

    return {
      ...video,
      id: video._id.toString(),
      _id: undefined,
    } as unknown as Video;
  } catch (error) {
    console.error(`Action: getVideoById fetch error for id ${id}:`, error);
    return undefined;
  }
}

export async function addVideoAction(formData: FormData) {
  
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'free' | 'paid';
    const videoFile = formData.get('videoFile') as File | null;

    if (!videoFile || !title || !description || !type) {
      return { success: false, message: 'Missing required fields.' };
    }

    // 1. File Storage Logic
    const videoStoragePath = path.join(process.cwd(), 'uploads', 'videos');
    await fs.mkdir(videoStoragePath, { recursive: true }); 
    
    const uniqueFilename = `${Date.now()}-${videoFile.name}`;
    const filePath = path.join(videoStoragePath, uniqueFilename);
    const fileUrl = `/uploads/videos/${uniqueFilename}`; 

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    // 2. Database Logic
    const newVideo: Omit<Video, 'id'> = {
      title,
      description,
      type,
      src: fileUrl,
      thumbnail: fileUrl,
      views: 0,
      uploadDate: new Date().toISOString(),
    };

    const { db } = await connectToDatabase();
    await db.collection('videos').insertOne(newVideo);

    // 3. Revalidation
    revalidatePath('/admin/videos');
    revalidatePath('/'); // Revalidate home page to show new video
    return { success: true, message: `Video added successfully.` };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to add video: ${errorMessage}` };
  }
}


export async function updateVideoAction(id: string, formData: FormData) {
   try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: 'Invalid Video ID.' };
    }

    const { db } = await connectToDatabase();
    const updateData: { [key: string]: any } = {};

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'free' | 'paid';
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;

    if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'No update data provided.' };
    }
    
    const result = await db.collection('videos').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, message: 'Video not found.' };
    }

    revalidatePath('/admin/videos');
    revalidatePath('/'); // Also revalidate home page
    return { success: true, message: 'Video updated successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to update video: ${errorMessage}` };
  }
}

export async function deleteVideoAction(id: string) {
    try {
        if (!id || !ObjectId.isValid(id)) {
          return { success: false, message: 'Invalid or missing Video ID.' };
        }
        
        const { db } = await connectToDatabase();
        const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });

        if (!video) {
            return { success: false, message: 'Video not found.' };
        }

        // 1. Delete the file from the filesystem
        if (video.src) {
            const filePath = path.join(process.cwd(), video.src.substring(1)); // Remove leading slash
            try {
                await fs.unlink(filePath);
            } catch (fileError: any) {
                if (fileError.code !== 'ENOENT') {
                   console.error(`Action: Could not delete file ${filePath}:`, fileError);
                }
            }
        }
        
        // 2. Delete the record from the database
        await db.collection('videos').deleteOne({ _id: new ObjectId(id) });

        revalidatePath('/admin/videos');
        revalidatePath('/');
        return { success: true, message: 'Video deleted successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Failed to delete video: ${errorMessage}` };
    }
}
