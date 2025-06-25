"use client";

import dynamic from "next/dynamic";

const MonthlyBookingsChart = dynamic(() => import("./MonthlyBookingsChart"), {
	ssr: false,
});

const ChartWrapper = ({
	data,
}: {
	data: { month: string; bookings: number }[];
}) => {
	return <MonthlyBookingsChart data={data} />;
};

export default ChartWrapper;
