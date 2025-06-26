import {
	Destination,
	CreateDestinationRequest,
	UpdateDestinationRequest,
} from "../schemas/destination";
import { prisma } from "../db"; // Import the Prisma client

export const getDestinations = async (
	page: number = 1,
	limit: number = 10,
	search?: string,
	country?: string
): Promise<{
	data: Destination[];
	total: number;
	page: number;
	limit: number;
}> => {
	const skip = (page - 1) * limit;
	const take = limit;

	let where: any = {};

	if (search) {
		where.OR = [
			{ name: { contains: search } },
			{ country: { contains: search } },
			{ description: { contains: search } },
		];
	}

	if (country) {
		where.country = { contains: country };
	}

	const [destinations, total] = await prisma.$transaction([
		prisma.destination.findMany({
			where,
			skip,
			take,
			orderBy: {
				name: "asc",
			},
		}),
		prisma.destination.count({ where }),
	]);

	return {
		data: destinations,
		total,
		page,
		limit,
	};
};

export const getDestinationById = async (
	id: string
): Promise<Destination | null> => {
	return prisma.destination.findUnique({
		where: { id },
	});
};

export const createDestination = async (
	data: CreateDestinationRequest
): Promise<Destination> => {
	return prisma.destination.create({
		data: {
			...data,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
};

export const updateDestination = async (
	id: string,
	data: UpdateDestinationRequest
): Promise<Destination | null> => {
	return prisma.destination.update({
		where: { id },
		data: {
			...data,
			updatedAt: new Date(),
		},
	});
};

export const deleteDestination = async (id: string): Promise<boolean> => {
	try {
		await prisma.destination.delete({
			where: { id },
		});
		return true;
	} catch (error) {
		console.error("Error deleting destination:", error);
		return false;
	}
};
