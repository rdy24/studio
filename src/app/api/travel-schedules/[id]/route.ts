import { NextRequest, NextResponse } from "next/server";
import {
	getTravelScheduleById,
	updateTravelSchedule,
	deleteTravelSchedule,
} from "@/lib/api/travel-schedules";
import { updateTravelScheduleSchema } from "@/lib/schemas/travel-schedule";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const travelSchedule = await getTravelScheduleById(params.id);

		if (!travelSchedule) {
			return NextResponse.json(
				{
					data: null,
					error: "Travel schedule not found",
					message: "The requested travel schedule could not be found",
					status_code: 404,
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			data: travelSchedule,
			error: null,
			message: "Travel schedule retrieved successfully",
			status_code: 200,
		});
	} catch (error) {
		console.error("Error fetching travel schedule:", error);

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to fetch travel schedule",
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const body = await request.json();

		// Convert date strings to Date objects
		if (body.startDatetime) {
			body.startDatetime = new Date(body.startDatetime);
		}
		if (body.endDatetime) {
			body.endDatetime = new Date(body.endDatetime);
		}

		const validatedData = updateTravelScheduleSchema.parse(body);
		const travelSchedule = await updateTravelSchedule(
			params.id,
			validatedData
		);

		if (!travelSchedule) {
			return NextResponse.json(
				{
					data: null,
					error: "Travel schedule not found",
					message: "The requested travel schedule could not be found",
					status_code: 404,
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			data: travelSchedule,
			error: null,
			message: "Travel schedule updated successfully",
			status_code: 200,
		});
	} catch (error) {
		console.error("Error updating travel schedule:", error);

		if (error instanceof Error) {
			return NextResponse.json(
				{
					data: null,
					error: error.message,
					message: "Failed to update travel schedule",
					status_code: 400,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to update travel schedule",
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await deleteTravelSchedule(params.id);

		return NextResponse.json(
			{
				data: null,
				error: null,
				message: "Travel schedule deleted successfully",
				status_code: 204,
			},
			{ status: 204 }
		);
	} catch (error) {
		console.error("Error deleting travel schedule:", error);

		if (error instanceof Error) {
			if (error.message === "Travel schedule not found") {
				return NextResponse.json(
					{
						data: null,
						error: "Travel schedule not found",
						message:
							"The requested travel schedule could not be found",
						status_code: 404,
					},
					{ status: 404 }
				);
			}

			return NextResponse.json(
				{
					data: null,
					error: error.message,
					message: "Failed to delete travel schedule",
					status_code: 400,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to delete travel schedule",
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}
