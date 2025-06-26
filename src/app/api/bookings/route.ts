import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	createBookingSchema,
	getBookingsQuerySchema,
	type CreateBookingInput,
	type GetBookingsQuery,
} from "@/lib/schemas/booking";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";
import { getBookings, createBooking } from "@/lib/api/bookings";

// GET /api/bookings - Get all bookings with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		console.log("=== GET /api/bookings - Starting ===");

		const { searchParams } = new URL(request.url);
		const query = getBookingsQuerySchema.parse({
			page: searchParams.get("page") || undefined,
			limit: searchParams.get("limit") || undefined,
			voyageId: searchParams.get("voyage_id") || undefined,
			userId: searchParams.get("user_id") || undefined,
			status: searchParams.get("status") || undefined,
			paymentStatus: searchParams.get("payment_status") || undefined,
		});

		console.log("Query parameters:", query);

		const result = await getBookings(query);

		console.log("Bookings found:", result.data.length);
		console.log("=== GET /api/bookings - Success ===");

		return createApiResponse(
			result,
			"Bookings retrieved successfully",
			200
		);
	} catch (error) {
		console.error("=== GET /api/bookings - Error ===");
		console.error("Error fetching bookings:", error);

		if (error instanceof z.ZodError) {
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch bookings",
			500
		);
	}
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
	try {
		console.log("=== POST /api/bookings - Starting ===");

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = createBookingSchema.parse(body);
		console.log("Validated data:", validatedData);

		const booking = await createBooking(validatedData);

		console.log("Booking created successfully:", booking?.id);
		console.log("=== POST /api/bookings - Success ===");

		return createApiResponse(booking, "Booking created successfully", 201);
	} catch (error) {
		console.error("=== POST /api/bookings - Error ===");
		console.error("Error creating booking:", error);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace"
		);

		if (error instanceof z.ZodError) {
			console.error("Zod validation errors:", error.errors);
			return createValidationErrorResponse(error);
		}

		if (error instanceof Error) {
			// Handle business logic errors (e.g., voyage or user not found)
			if (error.message.includes("Voyage not found")) {
				return createErrorResponse(
					"Invalid voyage",
					error.message,
					400
				);
			}
			if (error.message.includes("User not found")) {
				return createErrorResponse("Invalid user", error.message, 400);
			}
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to create booking",
			500
		);
	}
}
