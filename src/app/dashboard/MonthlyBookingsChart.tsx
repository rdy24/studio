"use client";

import {
	Bar,
	ResponsiveContainer,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	BarChart,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";

export default function MonthlyBookingsChart({
	data,
}: {
	data: { month: string; bookings: number }[];
}) {
	return (
		<Card className="shadow-lg w-full">
			<CardHeader>
				<CardTitle className="text-xl text-primary">
					Monthly Bookings
				</CardTitle>
				<CardDescription>
					Track booking trends over the past 6 months.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={{
						bookings: {
							label: "Bookings",
							color: "hsl(var(--primary))",
						},
					}}
					className="h-[300px] w-full"
				>
					<BarChart data={data} accessibilityLayer>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<YAxis tickLine={false} axisLine={false} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Legend />
						<Bar
							dataKey="bookings"
							fill="var(--color-bookings)"
							radius={4}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
