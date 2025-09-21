'use server';

import { revalidatePath } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown API error occurred');
  }
  // For POST/PUT, we might get a JSON response back. For DELETE, maybe not.
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {}; // Return empty object for non-json responses
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
    // We don't send the file on update for now, just metadata.
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
        if (!id) throw new Error('Video ID is missing.');

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
