import type { Video, UserActivity, RevenueData } from './types';

// This is a shared variable for both client and server side.
// On the server (in actions or API routes), process.env.NEXT_PUBLIC_API_BASE_URL might be undefined.
// In that case, we can assume it's a server-side call and use a relative path.
// However, for consistency and explicit control, it's better to ensure this is set.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function handleApiResponse(response: Response, context: string) {
    if (!response.ok) {
        let errorBody = 'Unknown error';
        try {
            errorBody = await response.text();
        } catch (e) {
            // ignore
        }
        console.error(`${context} Error: Status ${response.status}`, errorBody);
        throw new Error(`Failed during ${context}. Status: ${response.status}.`);
    }
    return response.json();
}


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

// --- API-based functions ---

export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos`, { 
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }
    });
    return await handleApiResponse(response, 'getVideos');
  } catch (error) {
    console.error("getVideos fetch error:", error);
    return []; // Return empty array on fetch error
  }
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
   try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${id}`, { cache: 'no-store' });
    return await handleApiResponse(response, `getVideoById(${id})`);
  } catch (error) {
    console.error(`getVideoById fetch error for id ${id}:`, error);
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
