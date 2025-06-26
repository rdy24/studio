import { NextRequest, NextResponse } from "next/server";
import {
	getTravelSchedules,
	createTravelSchedule,
} from "@/lib/api/travel-schedules";
import {
	getTravelSchedulesQuerySchema,
	createTravelScheduleSchema,
} from "@/lib/schemas/travel-schedule";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Parse and validate query parameters
		const queryParams = {
			page: searchParams.get("page") || "1",
			limit: searchParams.get("limit") || "10",
			search: searchParams.get("search") || undefined,
			voyage_id: searchParams.get("voyage_id") || undefined,
			status: searchParams.get("status") || undefined,
			start_datetime_from:
				searchParams.get("start_datetime_from") || undefined,
			start_datetime_to:
				searchParams.get("start_datetime_to") || undefined,
			participant_id: searchParams.get("participant_id") || undefined,
		};

		const validatedQuery = getTravelSchedulesQuerySchema.parse(queryParams);
		const result = await getTravelSchedules(validatedQuery);

		return NextResponse.json({
			data: result.data,
			pagination: result.pagination,
			error: null,
			message: "Travel schedules retrieved successfully",
			status_code: 200,
		});
	} catch (error) {
		console.error("Error fetching travel schedules:", error);

		if (error instanceof Error) {
			return NextResponse.json(
				{
					data: null,
					error: error.message,
					message: "Failed to fetch travel schedules",
					status_code: 400,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to fetch travel schedules",
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Convert date strings to Date objects
		if (body.startDatetime) {
			body.startDatetime = new Date(body.startDatetime);
		}
		if (body.endDatetime) {
			body.endDatetime = new Date(body.endDatetime);
		}

		const validatedData = createTravelScheduleSchema.parse(body);
		const travelSchedule = await createTravelSchedule(validatedData);

		return NextResponse.json(
			{
				data: travelSchedule,
				error: null,
				message: "Travel schedule created successfully",
				status_code: 201,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating travel schedule:", error);

		if (error instanceof Error) {
			return NextResponse.json(
				{
					data: null,
					error: error.message,
					message: "Failed to create travel schedule",
					status_code: 400,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to create travel schedule",
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}
