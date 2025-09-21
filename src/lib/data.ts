import type { Video, UserActivity, RevenueData } from './types';
import { PlaceHolderImages } from './placeholder-images';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// The mock data is now deprecated as we are using a real API.
// It's kept here for reference or fallback if needed.
const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/800/450`;

const rawVideos: (Omit<Video, 'thumbnail'> & { thumbnailId: string })[] = [
  // This data is no longer actively used by getVideos()
];

export const videos: Video[] = rawVideos.map(v => ({
    ...v,
    thumbnail: findImage(v.thumbnailId),
}));

export const userActivityData: UserActivity[] = [
  { date: 'May 1', 'Active Users': 2200 },
  { date: 'May 2', 'Active Users': 2500 },
  { date: 'May 3', 'Active Users': 2300 },
  { date: 'May 4', 'Active Users': 2780 },
  { date: 'May 5', 'Active Users': 1890 },
  { date: 'May 6', 'Active Users': 2390 },
  { date: 'May 7', 'Active Users': 3490 },
];

export const revenueData: RevenueData[] = [
  { date: 'Jan', 'Revenue (USD)': 4000 },
  { date: 'Feb', 'Revenue (USD)': 3000 },
  { date: 'Mar', 'Revenue (USD)': 5000 },
  { date: 'Apr', 'Revenue (USD)': 4500 },
  { date: 'May', 'Revenue (USD)': 6000 },
  { date: 'Jun', 'Revenue (USD)': 5500 },
];

// --- New API-based functions ---

export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch videos from API');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getVideos error:", error);
    return []; // Return empty array on error
  }
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
   try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch video ${id}`);
    }
    return response.json();
  } catch (error) {
    console.error(`getVideoById error for id ${id}:`, error);
    return undefined;
  }
}

// --- Analytics data remains the same ---

export const getAnalytics = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const dailyActive = userActivityData[userActivityData.length-1]?.['Active Users'] || 0;
  const monthlyActive = userActivityData.reduce((acc, curr) => acc + curr['Active Users'], 0);
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr['Revenue (USD)'], 0);
  return {
    dailyActiveUsers: dailyActive,
    monthlyActiveUsers: monthlyActive,
    totalRevenue: totalRevenue,
  }
}
