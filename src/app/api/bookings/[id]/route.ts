import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	updateBookingSchema,
	type UpdateBookingInput,
} from "@/lib/schemas/booking";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";
import {
	getBookingById,
	updateBooking,
	deleteBooking,
} from "@/lib/api/bookings";

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== GET /api/bookings/[id] - Starting ===");
		console.log("Booking ID:", params.id);

		const booking = await getBookingById(params.id);

		if (!booking) {
			console.log("Booking not found");
			console.log("=== GET /api/bookings/[id] - Not Found ===");
			return createErrorResponse(
				"Booking not found",
				"The requested booking could not be found",
				404
			);
		}

		console.log("Booking found:", booking.id);
		console.log("=== GET /api/bookings/[id] - Success ===");

		return createApiResponse(
			booking,
			"Booking retrieved successfully",
			200
		);
	} catch (error) {
		console.error("=== GET /api/bookings/[id] - Error ===");
		console.error("Error fetching booking:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch booking",
			500
		);
	}
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== PUT /api/bookings/[id] - Starting ===");
		console.log("Booking ID:", params.id);

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = updateBookingSchema.parse(body);
		console.log("Validated data:", validatedData);

		const booking = await updateBooking(params.id, validatedData);

		console.log("Booking updated successfully:", booking?.id);
		console.log("=== PUT /api/bookings/[id] - Success ===");

		return createApiResponse(booking, "Booking updated successfully", 200);
	} catch (error) {
		console.error("=== PUT /api/bookings/[id] - Error ===");
		console.error("Error updating booking:", error);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace"
		);

		if (error instanceof z.ZodError) {
			console.error("Zod validation errors:", error.errors);
			return createValidationErrorResponse(error);
		}

		if (error instanceof Error) {
			if (error.message.includes("Booking not found")) {
				return createErrorResponse(
					"Booking not found",
					error.message,
					404
				);
			}
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to update booking",
			500
		);
	}
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== DELETE /api/bookings/[id] - Starting ===");
		console.log("Booking ID:", params.id);

		await deleteBooking(params.id);

		console.log("Booking deleted successfully");
		console.log("=== DELETE /api/bookings/[id] - Success ===");

		return createApiResponse(null, "Booking deleted successfully", 204);
	} catch (error) {
		console.error("=== DELETE /api/bookings/[id] - Error ===");
		console.error("Error deleting booking:", error);

		if (error instanceof Error) {
			if (error.message.includes("Booking not found")) {
				return createErrorResponse(
					"Booking not found",
					error.message,
					404
				);
			}
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to delete booking",
			500
		);
	}
}
