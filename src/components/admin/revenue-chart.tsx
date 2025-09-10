'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import type { RevenueData } from '@/lib/types';

interface RevenueChartProps {
  data: RevenueData[];
}

const chartConfig: ChartConfig = {
  'Revenue (USD)': {
    label: 'Revenue (USD)',
    color: 'hsl(var(--accent))',
  },
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="Revenue (USD)"
              fill="hsl(var(--accent))"
              radius={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
