import { Users, Ship, Briefcase, Anchor, User } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import ChartWrapper from "./ChartWrapper";

const MetricCard = ({
	title,
	value,
	icon: Icon,
	change,
	changeType,
	description,
}: {
	title: string;
	value: string | number;
	icon: any;
	change?: string;
	changeType?: "positive" | "negative";
	description?: string;
}) => (
	<Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
		<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium text-muted-foreground">
				{title}
			</CardTitle>
			<Icon className="h-5 w-5 text-accent" />
		</CardHeader>
		<CardContent>
			<div className="text-2xl font-bold text-primary">{value}</div>
			{change && (
				<p
					className={`text-xs mt-1 ${
						changeType === "positive"
							? "text-green-600"
							: "text-red-600"
					}`}
				>
					{change}
				</p>
			)}
			{description && (
				<p className="text-xs text-muted-foreground mt-1">
					{description}
				</p>
			)}
		</CardContent>
	</Card>
);

export default async function DashboardPage() {
	// Fetch metrics from DB
	const [
		userCount,
		voyageCount,
		destinationCount,
		bookingCount,
		bookings,
		activities,
		activeVoyages,
	] = await Promise.all([
		prisma.user.count(),
		prisma.voyage.count(),
		prisma.destination.count(),
		prisma.booking.count({
			where: {
				bookingDate: {
					gte: new Date(
						new Date().getFullYear(),
						new Date().getMonth(),
						1
					),
					lte: new Date(),
				},
			},
		}),
		prisma.booking.findMany({
			where: {
				bookingDate: {
					gte: new Date(
						new Date().getFullYear(),
						new Date().getMonth() - 5,
						1
					),
					lte: new Date(),
				},
			},
			select: { bookingDate: true },
		}),
		prisma.activityLog.findMany({
			orderBy: { createdAt: "desc" },
			take: 4,
			include: { user: true },
		}),
		prisma.voyage.count({ where: { status: "Ongoing" } }),
	]);

	// Monthly bookings chart data
	const monthlyBookingsData = Array.from({ length: 6 }).map((_, i) => {
		const month = format(
			new Date(
				new Date().getFullYear(),
				new Date().getMonth() - 5 + i,
				1
			),
			"MMM"
		);
		const count = bookings.filter(
			(b) =>
				new Date(b.bookingDate).getMonth() ===
				new Date(
					new Date().getFullYear(),
					new Date().getMonth() - 5 + i,
					1
				).getMonth()
		).length;
		return { month, bookings: count };
	});

	const metrics = [
		{
			title: "Total Users",
			value: userCount,
			icon: Users,
		},
		{
			title: "Active Voyages",
			value: activeVoyages,
			icon: Ship,
			description: "Currently ongoing trips",
		},
		{
			title: "Bookings This Month",
			value: bookingCount,
			icon: Briefcase,
		},
		{
			title: "Destinations Served",
			value: destinationCount,
			icon: Anchor,
			description: "Unique locations covered",
		},
	];

	return (
		<div className="space-y-8 w-full p-4 md:p-6 lg:p-8">
			<h1 className="text-3xl font-bold text-primary tracking-tight">
				Dashboard Overview
			</h1>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => (
					<MetricCard key={metric.title} {...metric} />
				))}
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<ChartWrapper data={monthlyBookingsData} />

				<Card className="shadow-lg w-full">
					<CardHeader>
						<CardTitle className="text-xl text-primary">
							Recent Activity
						</CardTitle>
						<CardDescription>
							Overview of recent system activities.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3">
							{activities.map((activity, index) => (
								<li
									key={index}
									className="flex items-start space-x-2 sm:space-x-3"
								>
									<div className="flex-shrink-0 pt-1">
										<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
											<User className="h-4 w-4 text-secondary-foreground" />
										</span>
									</div>
									<div>
										<p className="text-sm">
											<span className="font-medium text-primary">
												{activity.user?.name ||
													"System"}
											</span>{" "}
											{activity.description}
										</p>
										<p className="text-xs text-muted-foreground">
											{format(
												new Date(activity.createdAt),
												"dd MMM yyyy HH:mm"
											)}
										</p>
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
