'use server';

import { classifyVideoContent } from '@/ai/flows/classify-video-content';
import { revalidatePath } from 'next/cache';
import type { Video } from '@/lib/types';
import { videos as mockVideos } from '@/lib/data';

export async function addVideoAction(data: { title: string, description: string, type: 'free' | 'paid' }) {
  console.log('Adding video:', data);

  try {
    const classification = await classifyVideoContent({
      title: data.title,
      description: data.description,
    });

    console.log('AI Classification:', classification);

    const newVideo: Video = {
      id: (mockVideos.length + 1).toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      category: classification.category,
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(data.title)}/800/450`,
      views: 0,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    
    // In a real app, you would save this to your database.
    // We are not persisting data in this example.
    console.log('Mock new video (not persisted):', newVideo);
    
    revalidatePath('/admin/videos');
    
    return { success: true, message: `Video added & classified as '${classification.category}'.` };
  } catch (error) {
    console.error('Error adding video:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to add video: ${errorMessage}` };
  }
}

export async function updateVideoAction(id: string, data: { title: string, description: string, type: 'free' | 'paid' }) {
  console.log('Updating video:', id, data);
  // In a real app, you'd update the video in the database.
  revalidatePath('/admin/videos');
  return { success: true, message: 'Video updated successfully.' };
}
