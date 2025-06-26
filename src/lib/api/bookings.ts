import { prisma } from "@/lib/db";
import type {
	CreateBookingInput,
	UpdateBookingInput,
	GetBookingsQuery,
} from "@/lib/schemas/booking";

export async function getBookings(query: GetBookingsQuery) {
	const { page, limit, voyageId, userId, status, paymentStatus } = query;
	const skip = (page - 1) * limit;

	// Build where clause for filtering
	const where: any = {};

	if (voyageId) {
		where.voyageId = voyageId;
	}

	if (userId) {
		where.userId = userId;
	}

	if (status) {
		where.status = status;
	}

	if (paymentStatus) {
		where.paymentStatus = paymentStatus;
	}

	// Get bookings with pagination
	const [bookings, total] = await Promise.all([
		prisma.booking.findMany({
			where,
			include: {
				voyage: {
					select: {
						id: true,
						name: true,
						description: true,
						startDate: true,
						endDate: true,
						price: true,
						status: true,
						imageUrl: true,
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						status: true,
						avatar: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.booking.count({ where }),
	]);

	// Transform data to match frontend interface
	const transformedBookings = bookings.map((booking) => ({
		id: booking.id,
		voyageId: booking.voyageId,
		userId: booking.userId,
		voyage: booking.voyage,
		user: booking.user,
		bookingDate: booking.bookingDate,
		status: booking.status as
			| "Pending"
			| "Confirmed"
			| "Cancelled"
			| "Completed",
		totalAmount: booking.totalAmount,
		paymentStatus: booking.paymentStatus as "Pending" | "Paid" | "Refunded",
		notes: booking.notes,
		createdAt: booking.createdAt,
		updatedAt: booking.updatedAt,
	}));

	const totalPages = Math.ceil(total / limit);

	return {
		data: transformedBookings,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}

export async function getBookingById(id: string) {
	const booking = await prisma.booking.findUnique({
		where: { id },
		include: {
			voyage: {
				select: {
					id: true,
					name: true,
					description: true,
					startDate: true,
					endDate: true,
					price: true,
					status: true,
					imageUrl: true,
				},
			},
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					status: true,
					avatar: true,
				},
			},
		},
	});

	if (!booking) {
		return null;
	}

	// Transform data to match frontend interface
	return {
		id: booking.id,
		voyageId: booking.voyageId,
		userId: booking.userId,
		voyage: booking.voyage,
		user: booking.user,
		bookingDate: booking.bookingDate,
		status: booking.status as
			| "Pending"
			| "Confirmed"
			| "Cancelled"
			| "Completed",
		totalAmount: booking.totalAmount,
		paymentStatus: booking.paymentStatus as "Pending" | "Paid" | "Refunded",
		notes: booking.notes,
		createdAt: booking.createdAt,
		updatedAt: booking.updatedAt,
	};
}

export async function createBooking(data: CreateBookingInput) {
	// Verify voyage exists
	const existingVoyage = await prisma.voyage.findUnique({
		where: { id: data.voyageId },
	});

	if (!existingVoyage) {
		throw new Error("Voyage not found");
	}

	// Verify user exists
	const existingUser = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!existingUser) {
		throw new Error("User not found");
	}

	// Create booking
	const booking = await prisma.booking.create({
		data: {
			voyageId: data.voyageId,
			userId: data.userId,
			bookingDate: new Date(),
			status: data.status || "Pending",
			totalAmount: data.totalAmount,
			paymentStatus: data.paymentStatus || "Pending",
			notes: data.notes,
		},
	});

	// Fetch the created booking with related data
	return await getBookingById(booking.id);
}

export async function updateBooking(id: string, data: UpdateBookingInput) {
	// Check if booking exists
	const existingBooking = await prisma.booking.findUnique({
		where: { id },
	});

	if (!existingBooking) {
		throw new Error("Booking not found");
	}

	// Update booking
	const updatedBooking = await prisma.booking.update({
		where: { id },
		data: {
			...(data.status && { status: data.status }),
			...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
			...(data.notes !== undefined && { notes: data.notes }),
		},
	});

	// Fetch the updated booking with related data
	return await getBookingById(id);
}

export async function deleteBooking(id: string) {
	// Check if booking exists
	const existingBooking = await prisma.booking.findUnique({
		where: { id },
	});

	if (!existingBooking) {
		throw new Error("Booking not found");
	}

	// Delete booking
	await prisma.booking.delete({
		where: { id },
	});

	return true;
}
