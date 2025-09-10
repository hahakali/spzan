import { getAnalytics, userActivityData, revenueData } from "@/lib/data";
import { DashboardCards } from "@/components/admin/dashboard-cards";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { UserActivityChart } from "@/components/admin/user-activity-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const analytics = await getAnalytics();

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          An overview of your platform's performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCards
          dailyActiveUsers={analytics.dailyActiveUsers}
          monthlyActiveUsers={analytics.monthlyActiveUsers}
          totalRevenue={analytics.totalRevenue}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityChart data={userActivityData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
