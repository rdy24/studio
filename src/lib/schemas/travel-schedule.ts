import { z } from "zod";

// Base travel schedule schema
export const travelScheduleSchema = z.object({
	id: z.string(),
	title: z.string(),
	voyageId: z.string(),
	startDatetime: z.date(),
	endDatetime: z.date(),
	location: z.string(),
	description: z.string().nullable(),
	status: z.enum(["Scheduled", "In Progress", "Completed", "Cancelled"]),
	participantIds: z.array(z.string()),
	notes: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create travel schedule request schema
export const createTravelScheduleSchema = z
	.object({
		title: z
			.string()
			.min(1, "Schedule title is required")
			.max(200, "Schedule title must be less than 200 characters")
			.trim(),
		voyageId: z.string().min(1, "Voyage ID is required"),
		startDatetime: z.date(),
		endDatetime: z.date(),
		location: z
			.string()
			.min(1, "Location is required")
			.max(200, "Location must be less than 200 characters")
			.trim(),
		description: z
			.string()
			.max(1000, "Description must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
		status: z
			.enum(["Scheduled", "In Progress", "Completed", "Cancelled"])
			.default("Scheduled"),
		participantIds: z.array(z.string()).optional().default([]),
		notes: z
			.string()
			.max(1000, "Notes must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			return data.startDatetime <= data.endDatetime;
		},
		{
			message: "End datetime must be after start datetime",
			path: ["endDatetime"],
		}
	);

// Update travel schedule request schema
export const updateTravelScheduleSchema = z
	.object({
		title: z
			.string()
			.min(1, "Schedule title is required")
			.max(200, "Schedule title must be less than 200 characters")
			.trim()
			.optional(),
		voyageId: z.string().min(1, "Voyage ID is required").optional(),
		startDatetime: z.date().optional(),
		endDatetime: z.date().optional(),
		location: z
			.string()
			.min(1, "Location is required")
			.max(200, "Location must be less than 200 characters")
			.trim()
			.optional(),
		description: z
			.string()
			.max(1000, "Description must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
		status: z
			.enum(["Scheduled", "In Progress", "Completed", "Cancelled"])
			.optional(),
		participantIds: z.array(z.string()).optional(),
		notes: z
			.string()
			.max(1000, "Notes must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			if (data.startDatetime && data.endDatetime) {
				return data.startDatetime <= data.endDatetime;
			}
			return true;
		},
		{
			message: "End datetime must be after start datetime",
			path: ["endDatetime"],
		}
	);

// Query parameters schema for GET requests
export const getTravelSchedulesQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.default("1")
		.transform((val) => parseInt(val, 10))
		.refine((val) => val > 0, "Page must be greater than 0"),
	limit: z
		.string()
		.optional()
		.default("10")
		.transform((val) => parseInt(val, 10))
		.refine(
			(val) => val > 0 && val <= 100,
			"Limit must be between 1 and 100"
		),
	search: z.string().optional().default(""),
	voyage_id: z.string().optional(),
	status: z
		.enum(["Scheduled", "In Progress", "Completed", "Cancelled"])
		.optional(),
	start_datetime_from: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const date = new Date(val);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid start datetime from format");
			}
			return date;
		}),
	start_datetime_to: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const date = new Date(val);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid start datetime to format");
			}
			return date;
		}),
	participant_id: z.string().optional(),
});

// Type exports
export type CreateTravelScheduleInput = z.infer<
	typeof createTravelScheduleSchema
>;
export type UpdateTravelScheduleInput = z.infer<
	typeof updateTravelScheduleSchema
>;
export type GetTravelSchedulesQuery = z.infer<
	typeof getTravelSchedulesQuerySchema
>;
export type TravelSchedule = z.infer<typeof travelScheduleSchema>;
