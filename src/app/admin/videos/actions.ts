'use server';

import { revalidatePath } from 'next/cache';
import type { Video } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred');
  }
  return response.json();
}

export async function addVideoAction(formData: FormData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await handleApiResponse(response);
    
    revalidatePath('/admin/videos');
    return { success: true, message: `Video added & classified as '${result.category}'.` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to add video: ${errorMessage}` };
  }
}

export async function updateVideoAction(id: string, formData: FormData) {
   try {
    // We don't send the file on update for now.
    // A more complex implementation could handle partial updates.
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
    };

    const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    await handleApiResponse(response);
    
    revalidatePath('/admin/videos');
    return { success: true, message: 'Video updated successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Failed to update video: ${errorMessage}` };
  }
}

export async function deleteVideoAction(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
            method: 'DELETE',
        });
        
        await handleApiResponse(response);
        
        revalidatePath('/admin/videos');
        return { success: true, message: 'Video deleted successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Failed to delete video: ${errorMessage}` };
    }
}
