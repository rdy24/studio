import { z } from "zod";

// Base booking schema
export const bookingSchema = z.object({
	id: z.string(),
	voyageId: z.string(),
	userId: z.string(),
	bookingDate: z.date(),
	status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]),
	totalAmount: z.number(),
	paymentStatus: z.enum(["Pending", "Paid", "Refunded"]),
	notes: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create booking request schema
export const createBookingSchema = z.object({
	voyageId: z.string().min(1, "Voyage ID is required").trim(),
	userId: z.string().min(1, "User ID is required").trim(),
	totalAmount: z
		.number()
		.min(0, "Total amount must be greater than or equal to 0")
		.max(999999.99, "Total amount must be less than 1,000,000"),
	status: z
		.enum(["Pending", "Confirmed", "Cancelled", "Completed"])
		.default("Pending"),
	paymentStatus: z.enum(["Pending", "Paid", "Refunded"]).default("Pending"),
	notes: z
		.string()
		.max(1000, "Notes must be less than 1000 characters")
		.trim()
		.optional()
		.nullable(),
});

// Update booking request schema
export const updateBookingSchema = z.object({
	status: z
		.enum(["Pending", "Confirmed", "Cancelled", "Completed"])
		.optional(),
	paymentStatus: z.enum(["Pending", "Paid", "Refunded"]).optional(),
	notes: z
		.string()
		.max(1000, "Notes must be less than 1000 characters")
		.trim()
		.optional()
		.nullable(),
});

// Query parameters schema for GET requests
export const getBookingsQuerySchema = z.object({
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
	voyageId: z.string().optional(),
	userId: z.string().optional(),
	status: z
		.enum(["Pending", "Confirmed", "Cancelled", "Completed"])
		.optional(),
	paymentStatus: z.enum(["Pending", "Paid", "Refunded"]).optional(),
});

// Type exports
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type GetBookingsQuery = z.infer<typeof getBookingsQuerySchema>;
export type Booking = z.infer<typeof bookingSchema>;
