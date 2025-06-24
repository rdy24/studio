import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { voyageSchema } from "@/lib/validations/voyage";
import { handleApiError, getPaginationParams } from "@/lib/api-utils";

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

// GET /api/voyages - Get all voyages
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status");
		const destinationId = searchParams.get("destinationId");
		const { page, perPage, skip } = getPaginationParams(searchParams);

		// Build filter conditions
		const where: any = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		if (status) {
			where.status = status;
		}

		// Get voyages with pagination
		const [voyages, total] = await Promise.all([
			prisma.voyage.findMany({
				where,
				skip,
				take: perPage,
				orderBy: {
					createdAt: "desc",
				},
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
			}),
			prisma.voyage.count({ where }),
		]);

		// Filter by destination if provided
		let filteredVoyages = voyages;
		if (destinationId) {
			const destId = parseInt(destinationId);
			filteredVoyages = voyages.filter((voyage) =>
				voyage.destinations.some((vd) => vd.destinationId === destId)
			);
		}

		// Transform voyages to match frontend format
		const transformedVoyages = filteredVoyages.map((voyage) => {
			return transformVoyageForResponse({
				...voyage,
				destinations: voyage.destinations.map((vd) => vd.destination),
			});
		});

		return NextResponse.json({
			data: transformedVoyages,
			total: destinationId ? filteredVoyages.length : total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(
				(destinationId ? filteredVoyages.length : total) / perPage
			),
		});
	} catch (error) {
		console.error("GET /api/voyages error:", error);
		return handleApiError(error);
	}
}

// POST /api/voyages - Create a new voyage
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = voyageSchema.parse(body);
		const { destination_ids, ...voyageData } = validatedData;

		// Create voyage
		const voyage = await prisma.voyage.create({
			data: {
				name: voyageData.name,
				startDate: voyageData.start_date
					? new Date(voyageData.start_date)
					: null,
				endDate: voyageData.end_date
					? new Date(voyageData.end_date)
					: null,
				price: voyageData.price,
				status: voyageData.status,
				description: voyageData.description,
				imageUrl: voyageData.image_url,
			},
		});

		// Create voyage-destination relationships
		await Promise.all(
			destination_ids.map((destinationId, index) =>
				prisma.voyageDestination.create({
					data: {
						voyageId: voyage.id,
						destinationId: destinationId,
						orderIndex: index,
					},
				})
			)
		);

		// Fetch the created voyage with its destinations
		const createdVoyage = await prisma.voyage.findUnique({
			where: { id: voyage.id },
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

		if (!createdVoyage) {
			throw new Error("Failed to retrieve created voyage");
		}

		// Transform voyage to match frontend format
		const transformedVoyage = transformVoyageForResponse({
			...createdVoyage,
			destinations: createdVoyage.destinations.map(
				(vd) => vd.destination
			),
		});

		return NextResponse.json(transformedVoyage, { status: 201 });
	} catch (error) {
		console.error("POST /api/voyages error:", error);
		return handleApiError(error);
	}
}
