import { prisma } from "@/lib/db";
import type {
	CreateVoyageInput,
	UpdateVoyageInput,
	GetVoyagesQuery,
} from "@/lib/schemas/voyage";

export async function getVoyages(query: GetVoyagesQuery) {
	const {
		page,
		limit,
		search,
		status,
		destinationId,
		startDateFrom,
		startDateTo,
		priceMin,
		priceMax,
	} = query;
	const skip = (page - 1) * limit;

	// Build where clause for filtering
	const where: any = {};

	if (search) {
		where.OR = [
			{ name: { contains: search } },
			{ description: { contains: search } },
		];
	}

	if (status) {
		where.status = status;
	}

	if (destinationId) {
		where.voyageDestinations = {
			some: {
				destinationId: destinationId,
			},
		};
	}

	if (startDateFrom || startDateTo) {
		where.startDate = {};
		if (startDateFrom) {
			where.startDate.gte = startDateFrom;
		}
		if (startDateTo) {
			where.startDate.lte = startDateTo;
		}
	}

	if (priceMin !== undefined || priceMax !== undefined) {
		where.price = {};
		if (priceMin !== undefined) {
			where.price.gte = priceMin;
		}
		if (priceMax !== undefined) {
			where.price.lte = priceMax;
		}
	}

	// Get voyages with pagination
	const [voyages, total] = await Promise.all([
		prisma.voyage.findMany({
			where,
			include: {
				voyageDestinations: {
					include: {
						destination: {
							select: {
								id: true,
								name: true,
								country: true,
								description: true,
								imageUrl: true,
							},
						},
					},
					orderBy: {
						sequenceOrder: "asc",
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.voyage.count({ where }),
	]);

	// Transform data to match frontend interface
	const transformedVoyages = voyages.map((voyage) => ({
		id: voyage.id,
		name: voyage.name,
		description: voyage.description,
		destinationIds: voyage.voyageDestinations.map((vd) => vd.destinationId),
		destinations: voyage.voyageDestinations.map((vd) => vd.destination),
		startDate: voyage.startDate,
		endDate: voyage.endDate,
		price: voyage.price,
		status: voyage.status as
			| "Upcoming"
			| "Ongoing"
			| "Completed"
			| "Cancelled",
		imageUrl: voyage.imageUrl,
		createdAt: voyage.createdAt,
		updatedAt: voyage.updatedAt,
	}));

	const totalPages = Math.ceil(total / limit);

	return {
		data: transformedVoyages,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}

export async function getVoyageById(id: string) {
	const voyage = await prisma.voyage.findUnique({
		where: { id },
		include: {
			voyageDestinations: {
				include: {
					destination: {
						select: {
							id: true,
							name: true,
							country: true,
							description: true,
							imageUrl: true,
						},
					},
				},
				orderBy: {
					sequenceOrder: "asc",
				},
			},
		},
	});

	if (!voyage) {
		return null;
	}

	// Transform data to match frontend interface
	return {
		id: voyage.id,
		name: voyage.name,
		description: voyage.description,
		destinationIds: voyage.voyageDestinations.map((vd) => vd.destinationId),
		destinations: voyage.voyageDestinations.map((vd) => vd.destination),
		startDate: voyage.startDate,
		endDate: voyage.endDate,
		price: voyage.price,
		status: voyage.status as
			| "Upcoming"
			| "Ongoing"
			| "Completed"
			| "Cancelled",
		imageUrl: voyage.imageUrl,
		createdAt: voyage.createdAt,
		updatedAt: voyage.updatedAt,
	};
}

export async function createVoyage(data: CreateVoyageInput) {
	// Verify destinations exist
	if (data.destinationIds && data.destinationIds.length > 0) {
		const existingDestinations = await prisma.destination.findMany({
			where: {
				id: {
					in: data.destinationIds,
				},
			},
		});

		const existingDestinationIds = existingDestinations.map((d) => d.id);
		const missingDestinations = data.destinationIds.filter(
			(destinationId) => !existingDestinationIds.includes(destinationId)
		);

		if (missingDestinations.length > 0) {
			throw new Error(
				`The following destinations do not exist: ${missingDestinations.join(
					", "
				)}`
			);
		}
	}

	// Create voyage
	const voyage = await prisma.voyage.create({
		data: {
			name: data.name,
			description: data.description,
			startDate: data.startDate,
			endDate: data.endDate,
			price: data.price,
			status: data.status,
			imageUrl: data.imageUrl,
		},
	});

	// Create voyage destinations if provided
	if (data.destinationIds && data.destinationIds.length > 0) {
		const voyageDestinationData = data.destinationIds.map(
			(destinationId, index) => ({
				voyageId: voyage.id,
				destinationId: destinationId,
				sequenceOrder: index + 1,
			})
		);

		await prisma.voyageDestination.createMany({
			data: voyageDestinationData,
		});
	}

	// Fetch the created voyage with destinations
	return await getVoyageById(voyage.id);
}

export async function updateVoyage(id: string, data: UpdateVoyageInput) {
	// Check if voyage exists
	const existingVoyage = await prisma.voyage.findUnique({
		where: { id },
	});

	if (!existingVoyage) {
		throw new Error("Voyage not found");
	}

	// Verify destinations exist (if destinations are being updated)
	if (data.destinationIds && data.destinationIds.length > 0) {
		const existingDestinations = await prisma.destination.findMany({
			where: {
				id: {
					in: data.destinationIds,
				},
			},
		});

		const existingDestinationIds = existingDestinations.map((d) => d.id);
		const missingDestinations = data.destinationIds.filter(
			(destinationId) => !existingDestinationIds.includes(destinationId)
		);

		if (missingDestinations.length > 0) {
			throw new Error(
				`The following destinations do not exist: ${missingDestinations.join(
					", "
				)}`
			);
		}
	}

	// Update voyage
	const updatedVoyage = await prisma.voyage.update({
		where: { id },
		data: {
			...(data.name && { name: data.name }),
			...(data.description !== undefined && {
				description: data.description,
			}),
			...(data.startDate !== undefined && { startDate: data.startDate }),
			...(data.endDate !== undefined && { endDate: data.endDate }),
			...(data.price !== undefined && { price: data.price }),
			...(data.status && { status: data.status }),
			...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
		},
	});

	// Update voyage destinations if provided
	if (data.destinationIds !== undefined) {
		// Delete existing voyage destinations
		await prisma.voyageDestination.deleteMany({
			where: { voyageId: id },
		});

		// Create new voyage destinations if any
		if (data.destinationIds.length > 0) {
			const voyageDestinationData = data.destinationIds.map(
				(destinationId, index) => ({
					voyageId: id,
					destinationId: destinationId,
					sequenceOrder: index + 1,
				})
			);

			await prisma.voyageDestination.createMany({
				data: voyageDestinationData,
			});
		}
	}

	// Fetch the updated voyage with destinations
	return await getVoyageById(id);
}

export async function deleteVoyage(id: string) {
	// Check if voyage exists
	const existingVoyage = await prisma.voyage.findUnique({
		where: { id },
	});

	if (!existingVoyage) {
		throw new Error("Voyage not found");
	}

	// Check if voyage has any bookings
	const bookingsCount = await prisma.booking.count({
		where: { voyageId: id },
	});

	if (bookingsCount > 0) {
		throw new Error(
			"Voyage cannot be deleted because it has existing bookings"
		);
	}

	// Delete voyage destinations first (cascade should handle this, but being explicit)
	await prisma.voyageDestination.deleteMany({
		where: { voyageId: id },
	});

	// Delete travel schedules associated with this voyage
	await prisma.travelSchedule.deleteMany({
		where: { voyageId: id },
	});

	// Delete voyage
	await prisma.voyage.delete({
		where: { id },
	});

	return true;
}
