import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	updateVoyageSchema,
	type UpdateVoyageInput,
} from "@/lib/schemas/voyage";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";
import { getVoyageById, updateVoyage, deleteVoyage } from "@/lib/api/voyages";

// GET /api/voyages/[id] - Get voyage by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== GET /api/voyages/[id] - Starting ===");
		console.log("Voyage ID:", params.id);

		const voyage = await getVoyageById(params.id);

		if (!voyage) {
			console.log("Voyage not found");
			return createErrorResponse(
				"Voyage not found",
				"The specified voyage does not exist",
				404
			);
		}

		console.log("=== GET /api/voyages/[id] - Success ===");
		return createApiResponse(voyage, "Voyage retrieved successfully", 200);
	} catch (error) {
		console.error("=== GET /api/voyages/[id] - Error ===");
		console.error("Error fetching voyage:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch voyage",
			500
		);
	}
}

// PUT /api/voyages/[id] - Update voyage
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== PUT /api/voyages/[id] - Starting ===");
		console.log("Voyage ID:", params.id);

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = updateVoyageSchema.parse(body);
		console.log("Validated data:", validatedData);

		const voyage = await updateVoyage(params.id, validatedData);

		console.log("Voyage updated successfully:", voyage?.id);
		console.log("=== PUT /api/voyages/[id] - Success ===");

		return createApiResponse(voyage, "Voyage updated successfully", 200);
	} catch (error) {
		console.error("=== PUT /api/voyages/[id] - Error ===");
		console.error("Error updating voyage:", error);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace"
		);

		if (error instanceof z.ZodError) {
			console.error("Zod validation errors:", error.errors);
			return createValidationErrorResponse(error);
		}

		if (error instanceof Error) {
			// Handle business logic errors
			if (error.message === "Voyage not found") {
				return createErrorResponse(
					"Voyage not found",
					"The specified voyage does not exist",
					404
				);
			}

			if (error.message.includes("destinations do not exist")) {
				return createErrorResponse(
					"Invalid destinations",
					error.message,
					400
				);
			}
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to update voyage",
			500
		);
	}
}

// DELETE /api/voyages/[id] - Delete voyage
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== DELETE /api/voyages/[id] - Starting ===");
		console.log("Voyage ID:", params.id);

		await deleteVoyage(params.id);

		console.log("Voyage deleted successfully");
		console.log("=== DELETE /api/voyages/[id] - Success ===");
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("=== DELETE /api/voyages/[id] - Error ===");
		console.error("Error deleting voyage:", error);

		if (error instanceof Error) {
			// Handle business logic errors
			if (error.message === "Voyage not found") {
				return createErrorResponse(
					"Voyage not found",
					"The specified voyage does not exist",
					404
				);
			}

			if (error.message.includes("existing bookings")) {
				return createErrorResponse(
					"Voyage cannot be deleted",
					"This voyage has existing bookings and cannot be deleted",
					409
				);
			}
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to delete voyage",
			500
		);
	}
}
