import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { destinationUpdateSchema } from "@/lib/validations/destination";
import { handleApiError } from "@/lib/api-utils";

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

// GET /api/destinations/[id] - Get a specific destination
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid destination ID" },
				{ status: 400 }
			);
		}

		const destination = await prisma.destination.findUnique({
			where: { id },
		});

		if (!destination) {
			return NextResponse.json(
				{ error: "Destination not found" },
				{ status: 404 }
			);
		}

		// Transform destination to match frontend format
		const transformedDestination =
			transformDestinationForResponse(destination);

		return NextResponse.json(transformedDestination);
	} catch (error) {
		console.error("GET /api/destinations/[id] error:", error);
		return handleApiError(error);
	}
}

// PUT /api/destinations/[id] - Update a destination
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid destination ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();

		// Validate request body
		const validatedData = destinationUpdateSchema.parse(body);

		// Check if destination exists
		const existingDestination = await prisma.destination.findUnique({
			where: { id },
		});

		if (!existingDestination) {
			return NextResponse.json(
				{ error: "Destination not found" },
				{ status: 404 }
			);
		}

		// Update destination
		const updatedDestination = await prisma.destination.update({
			where: { id },
			data: {
				name: validatedData.name,
				country: validatedData.country,
				description: validatedData.description,
				imageUrl: validatedData.imageUrl,
			},
		});

		// Transform destination to match frontend format
		const transformedDestination =
			transformDestinationForResponse(updatedDestination);

		return NextResponse.json(transformedDestination);
	} catch (error) {
		console.error("PUT /api/destinations/[id] error:", error);
		return handleApiError(error);
	}
}

// DELETE /api/destinations/[id] - Delete a destination
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid destination ID" },
				{ status: 400 }
			);
		}

		// Check if destination exists
		const existingDestination = await prisma.destination.findUnique({
			where: { id },
		});

		if (!existingDestination) {
			return NextResponse.json(
				{ error: "Destination not found" },
				{ status: 404 }
			);
		}

		// Check if destination is in use by any voyages
		const voyagesWithDestination = await prisma.voyageDestination.count({
			where: { destinationId: id },
		});

		if (voyagesWithDestination > 0) {
			return NextResponse.json(
				{ error: "Cannot delete destination that is used in voyages" },
				{ status: 400 }
			);
		}

		// Delete destination
		await prisma.destination.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "Destination deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("DELETE /api/destinations/[id] error:", error);
		return handleApiError(error);
	}
}
