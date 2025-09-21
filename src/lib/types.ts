import type { ObjectId } from 'mongodb';

export interface Video {
  id: string; // This will be the string representation of _id
  _id?: ObjectId; // The actual MongoDB ObjectId
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
