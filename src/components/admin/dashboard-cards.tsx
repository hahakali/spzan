import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Activity } from 'lucide-react';

interface DashboardCardsProps {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalRevenue: number;
}

export function DashboardCards({
  dailyActiveUsers,
  monthlyActiveUsers,
  totalRevenue,
}: DashboardCardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Lifetime earnings from premium content
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Active Users
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dailyActiveUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Users active in the last 24 hours
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Active</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {monthlyActiveUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Users active in the last 30 days
          </p>
        </CardContent>
      </Card>
    </>
  );
}
