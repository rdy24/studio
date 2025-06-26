import { prisma } from "@/lib/db";
import type {
	CreateTravelScheduleInput,
	UpdateTravelScheduleInput,
	GetTravelSchedulesQuery,
} from "@/lib/schemas/travel-schedule";

export async function getTravelSchedules(query: GetTravelSchedulesQuery) {
	const {
		page,
		limit,
		search,
		voyage_id,
		status,
		start_datetime_from,
		start_datetime_to,
		participant_id,
	} = query;
	const skip = (page - 1) * limit;

	// Build where clause for filtering
	const where: any = {};

	if (search) {
		where.OR = [
			{ title: { contains: search } },
			{ location: { contains: search } },
			{ description: { contains: search } },
		];
	}

	if (voyage_id) {
		where.voyageId = voyage_id;
	}

	if (status) {
		where.status = status;
	}

	if (start_datetime_from || start_datetime_to) {
		where.startDatetime = {};
		if (start_datetime_from) {
			where.startDatetime.gte = start_datetime_from;
		}
		if (start_datetime_to) {
			where.startDatetime.lte = start_datetime_to;
		}
	}

	if (participant_id) {
		where.travelScheduleParticipants = {
			some: {
				userId: participant_id,
			},
		};
	}

	// Get travel schedules with pagination
	const [travelSchedules, total] = await Promise.all([
		prisma.travelSchedule.findMany({
			where,
			include: {
				voyage: {
					select: {
						id: true,
						name: true,
					},
				},
				travelScheduleParticipants: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.travelSchedule.count({ where }),
	]);

	// Transform data to match frontend interface
	const transformedTravelSchedules = travelSchedules.map((schedule) => ({
		id: schedule.id,
		title: schedule.title,
		voyageId: schedule.voyageId,
		voyage: schedule.voyage,
		startDatetime: schedule.startDatetime,
		endDatetime: schedule.endDatetime,
		location: schedule.location,
		description: schedule.description,
		status: schedule.status as
			| "Scheduled"
			| "In Progress"
			| "Completed"
			| "Cancelled",
		participantIds: schedule.travelScheduleParticipants.map(
			(p: { userId: string }) => p.userId
		),
		participants: schedule.travelScheduleParticipants.map(
			(p: { user: any }) => p.user
		),
		notes: schedule.notes,
		createdAt: schedule.createdAt,
		updatedAt: schedule.updatedAt,
	}));

	const totalPages = Math.ceil(total / limit);

	return {
		data: transformedTravelSchedules,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	};
}

export async function getTravelScheduleById(id: string) {
	const travelSchedule = await prisma.travelSchedule.findUnique({
		where: { id },
		include: {
			voyage: {
				select: {
					id: true,
					name: true,
				},
			},
			travelScheduleParticipants: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
		},
	});

	if (!travelSchedule) {
		return null;
	}

	// Transform data to match frontend interface
	return {
		id: travelSchedule.id,
		title: travelSchedule.title,
		voyageId: travelSchedule.voyageId,
		voyage: travelSchedule.voyage,
		startDatetime: travelSchedule.startDatetime,
		endDatetime: travelSchedule.endDatetime,
		location: travelSchedule.location,
		description: travelSchedule.description,
		status: travelSchedule.status as
			| "Scheduled"
			| "In Progress"
			| "Completed"
			| "Cancelled",
		participantIds: travelSchedule.travelScheduleParticipants.map(
			(p: { userId: string }) => p.userId
		),
		participants: travelSchedule.travelScheduleParticipants.map(
			(p: { user: any }) => p.user
		),
		notes: travelSchedule.notes,
		createdAt: travelSchedule.createdAt,
		updatedAt: travelSchedule.updatedAt,
	};
}

export async function createTravelSchedule(data: CreateTravelScheduleInput) {
	// Verify voyage exists
	const existingVoyage = await prisma.voyage.findUnique({
		where: { id: data.voyageId },
	});

	if (!existingVoyage) {
		throw new Error("Voyage not found");
	}

	// Verify participants exist if provided
	if (data.participantIds && data.participantIds.length > 0) {
		const existingUsers = await prisma.user.findMany({
			where: {
				id: {
					in: data.participantIds,
				},
			},
		});

		const existingUserIds = existingUsers.map((u) => u.id);
		const missingUsers = data.participantIds.filter(
			(userId) => !existingUserIds.includes(userId)
		);

		if (missingUsers.length > 0) {
			throw new Error(
				`The following participants do not exist: ${missingUsers.join(
					", "
				)}`
			);
		}
	}

	// Create travel schedule
	const travelSchedule = await prisma.travelSchedule.create({
		data: {
			title: data.title,
			voyageId: data.voyageId,
			startDatetime: data.startDatetime,
			endDatetime: data.endDatetime,
			location: data.location,
			description: data.description,
			status: data.status,
			notes: data.notes,
		},
	});

	// Create travel schedule participants if provided
	if (data.participantIds && data.participantIds.length > 0) {
		const participantData = data.participantIds.map((userId) => ({
			scheduleId: travelSchedule.id,
			userId: userId,
		}));

		await prisma.travelScheduleParticipant.createMany({
			data: participantData,
		});
	}

	// Fetch the created travel schedule with relations
	return await getTravelScheduleById(travelSchedule.id);
}

export async function updateTravelSchedule(
	id: string,
	data: UpdateTravelScheduleInput
) {
	// Check if travel schedule exists
	const existingTravelSchedule = await prisma.travelSchedule.findUnique({
		where: { id },
	});

	if (!existingTravelSchedule) {
		throw new Error("Travel schedule not found");
	}

	// Verify voyage exists if voyageId is updated
	if (data.voyageId) {
		const existingVoyage = await prisma.voyage.findUnique({
			where: { id: data.voyageId },
		});
		if (!existingVoyage) {
			throw new Error("Voyage not found");
		}
	}

	// Verify participants exist if provided
	if (data.participantIds && data.participantIds.length > 0) {
		const existingUsers = await prisma.user.findMany({
			where: {
				id: {
					in: data.participantIds,
				},
			},
		});

		const existingUserIds = existingUsers.map((u) => u.id);
		const missingUsers = data.participantIds.filter(
			(userId) => !existingUserIds.includes(userId)
		);

		if (missingUsers.length > 0) {
			throw new Error(
				`The following participants do not exist: ${missingUsers.join(
					", "
				)}`
			);
		}
	}

	// Update travel schedule
	const updatedTravelSchedule = await prisma.travelSchedule.update({
		where: { id },
		data: {
			...(data.title && { title: data.title }),
			...(data.voyageId && { voyageId: data.voyageId }),
			...(data.startDatetime !== undefined && {
				startDatetime: data.startDatetime,
			}),
			...(data.endDatetime !== undefined && {
				endDatetime: data.endDatetime,
			}),
			...(data.location && { location: data.location }),
			...(data.description !== undefined && {
				description: data.description,
			}),
			...(data.status && { status: data.status }),
			...(data.notes !== undefined && { notes: data.notes }),
		},
	});

	// Update travel schedule participants if provided
	if (data.participantIds !== undefined) {
		// Delete existing participants
		await prisma.travelScheduleParticipant.deleteMany({
			where: { scheduleId: id },
		});

		// Create new participants if any
		if (data.participantIds.length > 0) {
			const participantData = data.participantIds.map((userId) => ({
				scheduleId: id,
				userId: userId,
			}));

			await prisma.travelScheduleParticipant.createMany({
				data: participantData,
			});
		}
	}

	// Fetch the updated travel schedule with relations
	return await getTravelScheduleById(id);
}

export async function deleteTravelSchedule(id: string) {
	// Check if travel schedule exists
	const existingTravelSchedule = await prisma.travelSchedule.findUnique({
		where: { id },
	});

	if (!existingTravelSchedule) {
		throw new Error("Travel schedule not found");
	}

	// Delete associated participants first
	await prisma.travelScheduleParticipant.deleteMany({
		where: { scheduleId: id },
	});

	// Delete travel schedule
	await prisma.travelSchedule.delete({
		where: { id },
	});

	return true;
}
