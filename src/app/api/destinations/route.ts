import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { destinationCreateSchema } from "@/lib/validations/destination";
import { handleApiError, getPaginationParams } from "@/lib/api-utils";

// Helper function to transform destination for response
function transformDestinationForResponse(destination: any) {
	return {
		id: destination.id.toString(),
		name: destination.name,
		country: destination.country,
		description: destination.description,
		imageUrl: destination.imageUrl,
	};
}

// GET /api/destinations - Get all destinations
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const { page, perPage, skip } = getPaginationParams(searchParams);

		// Build filter conditions
		const where: any = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ country: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		// Get destinations with pagination
		const [destinations, total] = await Promise.all([
			prisma.destination.findMany({
				where,
				skip,
				take: perPage,
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.destination.count({ where }),
		]);

		// Transform destinations to match frontend format
		const transformedDestinations = destinations.map(
			transformDestinationForResponse
		);

		return NextResponse.json({
			data: transformedDestinations,
			total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(total / perPage),
		});
	} catch (error) {
		console.error("GET /api/destinations error:", error);
		return handleApiError(error);
	}
}

// POST /api/destinations - Create a new destination
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = destinationCreateSchema.parse(body);

		// Create destination
		const destination = await prisma.destination.create({
			data: {
				name: validatedData.name,
				country: validatedData.country,
				description: validatedData.description,
				imageUrl: validatedData.imageUrl,
			},
		});

		// Transform destination to match frontend format
		const transformedDestination =
			transformDestinationForResponse(destination);

		return NextResponse.json(transformedDestination, { status: 201 });
	} catch (error) {
		console.error("POST /api/destinations error:", error);
		return handleApiError(error);
	}
}
