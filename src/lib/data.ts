import type { UserActivity, RevenueData } from './types';


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
