import { prisma } from "@/lib/prisma";
import {
	VoyageFormValues,
	VoyageUpdateFormValues,
} from "@/lib/validations/voyage";
import { Voyage, Destination, VoyageDestination } from "@prisma/client";

// Define types for the transformed voyage data
type VoyageWithDestinations = Voyage & {
	destinations: Destination[];
	destination_ids?: number[];
};

type VoyageWithRelations = Voyage & {
	destinations: VoyageDestination[] & {
		destination: Destination;
	};
};

export async function getVoyages() {
	try {
		const voyages = await prisma.voyage.findMany({
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

		// Transform the data to match the API schema
		return voyages.map((voyage: any) => ({
			...voyage,
			destinations: voyage.destinations.map((vd: any) => vd.destination),
			voyage_destinations: undefined,
		}));
	} catch (error) {
		console.error("Error fetching voyages:", error);
		throw new Error("Failed to fetch voyages");
	}
}

export async function getVoyageById(id: number) {
	try {
		const voyage = await prisma.voyage.findUnique({
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

		if (!voyage) {
			throw new Error("Voyage not found");
		}

		// Transform the data to match the API schema
		return {
			...voyage,
			destinations: voyage.destinations.map((vd: any) => vd.destination),
			destination_ids: voyage.destinations.map(
				(vd: any) => vd.destinationId
			),
			voyage_destinations: undefined,
		};
	} catch (error) {
		console.error(`Error fetching voyage with ID ${id}:`, error);
		throw error;
	}
}

export async function createVoyage(data: VoyageFormValues) {
	try {
		const { destination_ids, ...voyageData } = data;

		// Create the voyage
		const voyage = await prisma.voyage.create({
			data: voyageData,
		});

		// Create the voyage-destination relationships
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

		return getVoyageById(voyage.id);
	} catch (error) {
		console.error("Error creating voyage:", error);
		throw new Error("Failed to create voyage");
	}
}

export async function updateVoyage(id: number, data: VoyageUpdateFormValues) {
	try {
		const { destination_ids, ...voyageData } = data;

		// Update the voyage
		await prisma.voyage.update({
			where: { id },
			data: voyageData,
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

		return getVoyageById(id);
	} catch (error) {
		console.error(`Error updating voyage with ID ${id}:`, error);
		throw error;
	}
}

export async function deleteVoyage(id: number) {
	try {
		// Delete the voyage-destination relationships first
		await prisma.voyageDestination.deleteMany({
			where: { voyageId: id },
		});

		// Delete the voyage
		await prisma.voyage.delete({
			where: { id },
		});

		return { success: true };
	} catch (error) {
		console.error(`Error deleting voyage with ID ${id}:`, error);
		throw new Error("Failed to delete voyage");
	}
}
