import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	createVoyageSchema,
	getVoyagesQuerySchema,
	type CreateVoyageInput,
	type GetVoyagesQuery,
} from "@/lib/schemas/voyage";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";
import { getVoyages, createVoyage } from "@/lib/api/voyages";

// GET /api/voyages - Get all voyages with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		console.log("=== GET /api/voyages - Starting ===");

		const { searchParams } = new URL(request.url);
		const query = getVoyagesQuerySchema.parse({
			page: searchParams.get("page") || undefined,
			limit: searchParams.get("limit") || undefined,
			search: searchParams.get("search") || undefined,
			status: searchParams.get("status") || undefined,
			destinationId: searchParams.get("destination_id") || undefined,
			startDateFrom: searchParams.get("start_date_from") || undefined,
			startDateTo: searchParams.get("start_date_to") || undefined,
			priceMin: searchParams.get("price_min") || undefined,
			priceMax: searchParams.get("price_max") || undefined,
		});

		console.log("Query parameters:", query);

		const result = await getVoyages(query);

		console.log("Voyages found:", result.data.length);
		console.log("=== GET /api/voyages - Success ===");

		return createApiResponse(result, "Voyages retrieved successfully", 200);
	} catch (error) {
		console.error("=== GET /api/voyages - Error ===");
		console.error("Error fetching voyages:", error);

		if (error instanceof z.ZodError) {
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch voyages",
			500
		);
	}
}

// POST /api/voyages - Create a new voyage
export async function POST(request: NextRequest) {
	try {
		console.log("=== POST /api/voyages - Starting ===");

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = createVoyageSchema.parse(body);
		console.log("Validated data:", validatedData);

		const voyage = await createVoyage(validatedData);

		console.log("Voyage created successfully:", voyage?.id);
		console.log("=== POST /api/voyages - Success ===");

		return createApiResponse(voyage, "Voyage created successfully", 201);
	} catch (error) {
		console.error("=== POST /api/voyages - Error ===");
		console.error("Error creating voyage:", error);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace"
		);

		if (error instanceof z.ZodError) {
			console.error("Zod validation errors:", error.errors);
			return createValidationErrorResponse(error);
		}

		if (error instanceof Error) {
			// Handle business logic errors (e.g., destinations not found)
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
			"Failed to create voyage",
			500
		);
	}
}
