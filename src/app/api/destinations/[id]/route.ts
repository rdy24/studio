import { NextResponse } from "next/server";
import {
	getDestinationById,
	updateDestination,
	deleteDestination,
} from "@/lib/api/destinations";
import { updateDestinationSchema } from "@/lib/schemas/destination";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const destination = await getDestinationById(params.id);
		if (!destination) {
			return NextResponse.json(
				{
					data: null,
					error: "Not Found",
					message: "Destination not found",
					status_code: 404,
				},
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{
				data: destination,
				error: null,
				message: "Destination retrieved successfully",
				status_code: 200,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error fetching destination:", error);
		return NextResponse.json(
			{
				data: null,
				error: "Internal Server Error",
				message: error.message,
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const json = await request.json();
		const validatedData = updateDestinationSchema.parse(json);
		const updatedDestination = await updateDestination(
			params.id,
			validatedData
		);

		if (!updatedDestination) {
			return NextResponse.json(
				{
					data: null,
					error: "Not Found",
					message: "Destination not found",
					status_code: 404,
				},
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{
				data: updatedDestination,
				error: null,
				message: "Destination updated successfully",
				status_code: 200,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating destination:", error);
		if (error.name === "ZodError") {
			return NextResponse.json(
				{
					data: null,
					error: "Validation Error",
					message: "The request data is invalid",
					details: error.errors,
					status_code: 422,
				},
				{ status: 422 }
			);
		}
		return NextResponse.json(
			{
				data: null,
				error: "Internal Server Error",
				message: error.message,
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const success = await deleteDestination(params.id);
		if (!success) {
			return NextResponse.json(
				{
					data: null,
					error: "Not Found",
					message: "Destination not found or could not be deleted",
					status_code: 404,
				},
				{ status: 404 }
			);
		}
		return NextResponse.json(
			{
				data: null,
				error: null,
				message: "Destination deleted successfully",
				status_code: 204,
			},
			{ status: 204 }
		);
	} catch (error: any) {
		console.error("Error deleting destination:", error);
		return NextResponse.json(
			{
				data: null,
				error: "Internal Server Error",
				message: error.message,
				status_code: 500,
			},
			{ status: 500 }
		);
	}
}
