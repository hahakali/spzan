
// Note: This interface is used for client-side components.
// The string 'id' is a transformation of MongoDB's ObjectId.
export interface Video {
  id: string;
  title: string;
  description: string;
  src: string;
  thumbnail: string;
  type: 'free' | 'paid';
  views: number;
  uploadDate: string;
}

export interface UserActivity {
  date: string;
  'Active Users': number;
}

export interface RevenueData {
  date: string;
  'Revenue (USD)': number;
}
