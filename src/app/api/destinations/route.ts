import { NextResponse } from "next/server";
import { getDestinations, createDestination } from "@/lib/api/destinations";
import { createDestinationSchema } from "@/lib/schemas/destination";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || undefined;
		const country = searchParams.get("country") || undefined;

		const {
			data,
			total,
			page: currentPage,
			limit: currentLimit,
		} = await getDestinations(page, limit, search, country);

		return NextResponse.json(
			{
				data: data,
				error: null,
				message: "Destinations retrieved successfully",
				status_code: 200,
				pagination: {
					page: currentPage,
					limit: currentLimit,
					total,
					totalPages: Math.ceil(total / currentLimit),
				},
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error fetching destinations:", error);
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

export async function POST(request: Request) {
	try {
		const json = await request.json();
		const validatedData = createDestinationSchema.parse(json);
		const newDestination = await createDestination(validatedData);
		return NextResponse.json(
			{
				data: newDestination,
				error: null,
				message: "Destination created successfully",
				status_code: 201,
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Error creating destination:", error);
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
