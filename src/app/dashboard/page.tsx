
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Ship, Briefcase, Anchor, User } from "lucide-react";
import type { MetricCardProps } from "@/types";
import { Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const MetricCard = ({ title, value, icon: Icon, change, changeType, description }: MetricCardProps) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-accent" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
      {change && (
        <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      )}
      {description && (
         <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const monthlyBookingsData = [
  { month: "Jan", bookings: 120 },
  { month: "Feb", bookings: 150 },
  { month: "Mar", bookings: 200 },
  { month: "Apr", bookings: 180 },
  { month: "May", bookings: 220 },
  { month: "Jun", bookings: 250 },
];

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "hsl(var(--primary))",
  },
};

export default function DashboardPage() {
  const metrics: MetricCardProps[] = [
    { title: "Total Users", value: "1,250", icon: Users, change: "+15% from last month", changeType: "positive" },
    { title: "Active Voyages", value: "78", icon: Ship, description: "Currently ongoing trips" },
    { title: "Bookings This Month", value: "320", icon: Briefcase, change: "-5% from last month", changeType: "negative" },
    { title: "Destinations Served", value: "45", icon: Anchor, description: "Unique locations covered" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Monthly Bookings</CardTitle>
            <CardDescription>Track booking trends over the past 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyBookingsData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Legend />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Activity</CardTitle>
            <CardDescription>Overview of recent system activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                {user: "Alice", action: "added a new voyage to The Maldives.", time: "2 hours ago"},
                {user: "Bob", action: "updated user profile for client 'John Doe'.", time: "5 hours ago"},
                {user: "Charlie", action: "processed 15 new bookings.", time: "1 day ago"},
                {user: "System", action: "generated EOM financial report.", time: "2 days ago"},
              ].map((activity, index) => (
                <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-primary">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
