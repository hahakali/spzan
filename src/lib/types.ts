export interface Video {
  id: string;
  title: string;
  description: string;
  src: string;
  thumbnail: string;
  type: 'free' | 'paid';
  views: number;
  uploadDate: string;
  category?: string;
}

export interface UserActivity {
  date: string;
  'Active Users': number;
}

export interface RevenueData {
  date: string;
  'Revenue (USD)': number;
}
