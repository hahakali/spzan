
'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import type { Video } from '@/lib/types';
import path from 'path';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';

export async function getVideos(): Promise<Video[]> {
  console.log("Action: getVideos called.");
  try {
    const { db } = await connectToDatabase();
    const videos = await db
      .collection('videos')
      .find()
      .sort({ uploadDate: -1 })
      .toArray();

    const formattedVideos = videos.map(video => ({
        ...video,
        id: video._id.toString(),
    })) as Video[];
    
    console.log(`Action: Found and formatted ${formattedVideos.length} videos.`);
    return formattedVideos;
  } catch (error) {
    console.error("Action: getVideos fetch error:", error);
    return [];
  }
};

export async function getVideoById(id: string): Promise<Video | undefined> {
   console.log(`Action: getVideoById called for id ${id}.`);
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
    } as Video;
  } catch (error) {
    console.error(`Action: getVideoById fetch error for id ${id}:`, error);
    return undefined;
  }
}

export async function addVideoAction(formData: FormData) {
  console.log('[addVideoAction] - Action started.');
  
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'free' | 'paid';
    const videoFile = formData.get('videoFile') as File | null;

    if (!videoFile || !title || !description || !type) {
      console.error('[addVideoAction] - Aborting. Missing required fields.');
      return { success: false, message: 'Missing required fields.' };
    }
    console.log(`[addVideoAction] - Received data: title='${title}', type='${type}'.`);

    // 1. File Storage Logic
    console.log('[addVideoAction] - Step 1: Preparing to save video file.');
    const videoStoragePath = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await fs.mkdir(videoStoragePath, { recursive: true }); 
    
    const uniqueFilename = `${Date.now()}-${videoFile.name}`;
    const filePath = path.join(videoStoragePath, uniqueFilename);
    const fileUrl = `/uploads/videos/${uniqueFilename}`; 

    console.log(`[addVideoAction] - Saving file to: ${filePath}`);
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    console.log(`[addVideoAction] - Successfully saved file. Public URL will be: ${fileUrl}`);
    
    // 2. Database Logic
    console.log('[addVideoAction] - Step 2: Preparing to write metadata to database.');
    const newVideo: Omit<Video, 'id' | '_id'> = {
      title,
      description,
      type,
      src: fileUrl,
      thumbnail: fileUrl,
      views: 0,
      uploadDate: new Date().toISOString(),
    };

    console.log('[addVideoAction] - Connecting to database...');
    const { db } = await connectToDatabase();
    console.log('[addVideoAction] - Database connected. Inserting new video document...');
    const result = await db.collection('videos').insertOne(newVideo);
    console.log('[addVideoAction] - Successfully inserted video into DB with ID:', result.insertedId);

    // 3. Revalidation
    console.log('[addVideoAction] - Step 3: Revalidating paths.');
    revalidatePath('/admin/videos');
    revalidatePath('/');
    console.log('[addVideoAction] - Action finished successfully.');
    return { success: true, message: `Video added successfully.` };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('[addVideoAction] - An error occurred:', error);
    return { success: false, message: `Failed to add video: ${errorMessage}` };
  }
}


export async function updateVideoAction(id: string, formData: FormData) {
  console.log(`Action: updateVideoAction started for ID: ${id}.`);
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
    
    console.log(`Action: Updating video ${id} with:`, updateData);

    const result = await db.collection('videos').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, message: 'Video not found.' };
    }

    console.log(`Action: Video ${id} updated successfully in DB.`);
    revalidatePath('/admin/videos');
    revalidatePath('/');
    return { success: true, message: 'Video updated successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('updateVideoAction failed:', errorMessage);
    return { success: false, message: `Failed to update video: ${errorMessage}` };
  }
}

export async function deleteVideoAction(id: string) {
    console.log(`Action: deleteVideoAction started for ID: ${id}`);
    try {
        if (!id || !ObjectId.isValid(id)) {
          return { success: false, message: 'Invalid or missing Video ID.' };
        }
        
        const { db } = await connectToDatabase();
        const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });

        if (!video) {
            console.error(`Action: Video with ID ${id} not found in database.`);
            return { success: false, message: 'Video not found.' };
        }

        // 1. Delete the file from the filesystem
        if (video.src) {
            const filePath = path.join(process.cwd(), 'public', video.src);
            try {
                await fs.unlink(filePath);
                console.log(`Action: Successfully deleted video file: ${filePath}`);
            } catch (fileError: any) {
                // If file doesn't exist, we can still proceed to delete DB record
                if (fileError.code === 'ENOENT') {
                   console.warn(`Action: Video file not found at ${filePath}, but proceeding to delete database record.`);
                } else {
                   // Log error but don't block DB deletion
                   console.error(`Action: Could not delete file ${filePath}:`, fileError);
                }
            }
        }
        
        // 2. Delete the record from the database
        await db.collection('videos').deleteOne({ _id: new ObjectId(id) });
        console.log(`Action: Successfully deleted video record from database for ID: ${id}`);

        revalidatePath('/admin/videos');
        revalidatePath('/');
        return { success: true, message: 'Video deleted successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('deleteVideoAction failed:', errorMessage);
        return { success: false, message: `Failed to delete video: ${errorMessage}` };
    }
}
