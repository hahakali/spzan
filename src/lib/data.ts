import type { Video, UserActivity, RevenueData } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/800/450`;

const rawVideos: (Omit<Video, 'thumbnail'> & { thumbnailId: string })[] = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    description: 'A classic open-source animation from the Blender Institute, telling the story of a gentle giant rabbit.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailId: 'big-buck-bunny',
    type: 'free',
    views: 120543,
    uploadDate: '2023-10-15',
    category: 'Entertainment',
  },
  {
    id: '2',
    title: 'Elephants Dream',
    description: 'The first open-source movie, a surreal and visually stunning short film about two characters exploring a strange machine.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailId: 'elephants-dream',
    type: 'paid',
    views: 89765,
    uploadDate: '2023-10-20',
    category: 'Entertainment',
  },
  {
    id: '3',
    title: 'For Bigger Blazes',
    description: 'A short, fun animation showcasing impressive fire effects and a playful dragon.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailId: 'for-bigger-blazes',
    type: 'free',
    views: 99876,
    uploadDate: '2023-11-01',
    category: 'Entertainment',
  },
  {
    id: '4',
    title: 'For Bigger Escapes',
    description: 'Follow an adventurous character as they make a thrilling escape from a precarious situation.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailId: 'for-bigger-escapes',
    type: 'paid',
    views: 210432,
    uploadDate: '2023-11-05',
    category: 'Travel',
  },
  {
    id: '5',
    title: 'For Bigger Fun',
    description: 'Experience pure joy and laughter with this delightful and colorful short animation.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailId: 'for-bigger-fun',
    type: 'free',
    views: 154987,
    uploadDate: '2023-11-12',
    category: 'Entertainment',
  },
   {
    id: '6',
    title: 'For Bigger Joyrides',
    description: 'A high-speed animated adventure that will get your adrenaline pumping. Buckle up for a wild ride!',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailId: 'for-bigger-joyrides',
    type: 'paid',
    views: 78654,
    uploadDate: '2023-11-18',
    category: 'Sports',
  },
  {
    id: '7',
    title: 'Sintel',
    description: 'A dramatic and emotional fantasy short film about a young woman on a quest to find her dragon.',
    src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailId: 'sintel',
    type: 'free',
    views: 345987,
    uploadDate: '2023-12-01',
    category: 'Entertainment',
  },
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

export const getVideos = async (): Promise<Video[]> => {
    // In a real app, this would be a database call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve(videos);
};

export const getVideoById = async (id: string): Promise<Video | undefined> => {
    return Promise.resolve(videos.find(v => v.id === id));
}

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
