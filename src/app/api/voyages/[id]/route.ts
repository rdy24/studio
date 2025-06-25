import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { voyageUpdateSchema } from "@/lib/validations/voyage";
import { handleApiError } from "@/lib/api-utils";

// Types for Voyage response
interface VoyageResponse {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	price: number;
	status: string;
	description: string;
	imageUrl: string;
	destinations: {
		id: string;
		name: string;
		country: string;
		description: string;
		imageUrl: string;
	}[];
}

// Helper function to transform voyage for response
function transformVoyageForResponse(voyage: any) {
	return {
		id: voyage.id.toString(),
		name: voyage.name,
		startDate: voyage.startDate,
		endDate: voyage.endDate,
		price: voyage.price,
		status: voyage.status,
		description: voyage.description,
		imageUrl: voyage.imageUrl,
		destinations: voyage.destinations?.map((destination: any) => ({
			id: destination.id.toString(),
			name: destination.name,
			country: destination.country,
			description: destination.description,
			imageUrl: destination.imageUrl,
		})),
	};
}

// GET /api/voyages/[id] - Get a voyage by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid ID format" },
				{ status: 400 }
			);
		}
		const voyage = await prisma.voyage.findUnique({
			where: { id },
			include: {
				destinations: {
					include: {
						destination: true,
					},
					orderBy: { orderIndex: "asc" },
				},
			},
		});
		if (!voyage) {
			return NextResponse.json(
				{ error: "Voyage not found" },
				{ status: 404 }
			);
		}
		// Transform voyage to match frontend format
		const transformedVoyage: VoyageResponse =
			transformVoyageForResponse(voyage);
		return NextResponse.json(transformedVoyage);
	} catch (error: any) {
		console.error("GET /api/voyages/[id] error:", error?.message || error);
		return handleApiError(error);
	}
}

// PUT /api/voyages/[id] - Update a voyage by ID
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid ID format" },
				{ status: 400 }
			);
		}

		// Check if voyage exists
		const existingVoyage = await prisma.voyage.findUnique({
			where: { id },
		});

		if (!existingVoyage) {
			return NextResponse.json(
				{ error: "Voyage not found" },
				{ status: 404 }
			);
		}

		const body = await request.json();

		// Validate request body
		const validatedData = voyageUpdateSchema.parse(body);
		const { destination_ids, ...voyageData } = validatedData;

		// Update voyage
		await prisma.voyage.update({
			where: { id },
			data: {
				name: voyageData.name,
				startDate: voyageData.start_date
					? new Date(voyageData.start_date)
					: undefined,
				endDate: voyageData.end_date
					? new Date(voyageData.end_date)
					: undefined,
				price: voyageData.price,
				status: voyageData.status,
				description: voyageData.description,
				imageUrl: voyageData.image_url,
			},
		});

		// If destination_ids are provided, update the voyage-destination relationships
		if (destination_ids && destination_ids.length > 0) {
			// Delete existing relationships
			await prisma.voyageDestination.deleteMany({
				where: { voyageId: id },
			});

			// Create new relationships
			await Promise.all(
				destination_ids.map((destinationId, index) =>
					prisma.voyageDestination.create({
						data: {
							voyageId: id,
							destinationId: destinationId,
							orderIndex: index,
						},
					})
				)
			);
		}

		// Fetch the updated voyage with its destinations
		const updatedVoyage = await prisma.voyage.findUnique({
			where: { id },
			include: {
				destinations: {
					include: {
						destination: true,
					},
					orderBy: {
						orderIndex: "asc",
					},
				},
			},
		});

		if (!updatedVoyage) {
			throw new Error("Failed to retrieve updated voyage");
		}

		// Transform voyage to match frontend format
		const transformedVoyage = transformVoyageForResponse({
			...updatedVoyage,
			destinations: updatedVoyage.destinations.map(
				(vd) => vd.destination
			),
		});

		return NextResponse.json(transformedVoyage);
	} catch (error) {
		console.error(`PUT /api/voyages/${params.id} error:`, error);
		return handleApiError(error);
	}
}

// DELETE /api/voyages/[id] - Delete a voyage by ID
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid ID format" },
				{ status: 400 }
			);
		}

		// Check if voyage exists
		const existingVoyage = await prisma.voyage.findUnique({
			where: { id },
		});

		if (!existingVoyage) {
			return NextResponse.json(
				{ error: "Voyage not found" },
				{ status: 404 }
			);
		}

		// Delete voyage-destination relationships first
		await prisma.voyageDestination.deleteMany({
			where: { voyageId: id },
		});

		// Delete voyage
		await prisma.voyage.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`DELETE /api/voyages/${params.id} error:`, error);
		return handleApiError(error);
	}
}
