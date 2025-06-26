import { z } from "zod";

// Base voyage schema
export const voyageSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	destinationIds: z.array(z.string()),
	startDate: z.date().nullable(),
	endDate: z.date().nullable(),
	price: z.number(),
	status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]),
	imageUrl: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create voyage request schema
export const createVoyageSchema = z
	.object({
		name: z
			.string()
			.min(1, "Voyage name is required")
			.max(200, "Voyage name must be less than 200 characters")
			.trim(),
		description: z
			.string()
			.max(1000, "Description must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
		destinationIds: z
			.array(z.string())
			.min(1, "At least one destination is required")
			.max(10, "Maximum 10 destinations allowed"),
		startDate: z
			.string()
			.optional()
			.nullable()
			.transform((val) => {
				if (!val) return null;
				const date = new Date(val);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid start date format");
				}
				return date;
			}),
		endDate: z
			.string()
			.optional()
			.nullable()
			.transform((val) => {
				if (!val) return null;
				const date = new Date(val);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid end date format");
				}
				return date;
			}),
		price: z
			.number()
			.min(0, "Price must be greater than or equal to 0")
			.max(999999.99, "Price must be less than 1,000,000"),
		status: z
			.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"])
			.default("Upcoming"),
		imageUrl: z
			.string()
			.url("Invalid image URL format")
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.startDate <= data.endDate;
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		}
	);

// Update voyage request schema
export const updateVoyageSchema = z
	.object({
		name: z
			.string()
			.min(1, "Voyage name is required")
			.max(200, "Voyage name must be less than 200 characters")
			.trim()
			.optional(),
		description: z
			.string()
			.max(1000, "Description must be less than 1000 characters")
			.trim()
			.optional()
			.nullable(),
		destinationIds: z
			.array(z.string())
			.min(1, "At least one destination is required")
			.max(10, "Maximum 10 destinations allowed")
			.optional(),
		startDate: z
			.string()
			.optional()
			.nullable()
			.transform((val) => {
				if (val === null || val === undefined) return null;
				if (val === "") return null;
				const date = new Date(val);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid start date format");
				}
				return date;
			}),
		endDate: z
			.string()
			.optional()
			.nullable()
			.transform((val) => {
				if (val === null || val === undefined) return null;
				if (val === "") return null;
				const date = new Date(val);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid end date format");
				}
				return date;
			}),
		price: z
			.number()
			.min(0, "Price must be greater than or equal to 0")
			.max(999999.99, "Price must be less than 1,000,000")
			.optional(),
		status: z
			.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"])
			.optional(),
		imageUrl: z
			.string()
			.url("Invalid image URL format")
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.startDate <= data.endDate;
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		}
	);

// Query parameters schema for GET requests
export const getVoyagesQuerySchema = z.object({
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
	status: z
		.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"])
		.optional(),
	destinationId: z.string().optional(),
	startDateFrom: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const date = new Date(val);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid start date from format");
			}
			return date;
		}),
	startDateTo: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const date = new Date(val);
			if (isNaN(date.getTime())) {
				throw new Error("Invalid start date to format");
			}
			return date;
		}),
	priceMin: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const price = parseFloat(val);
			if (isNaN(price)) {
				throw new Error("Invalid minimum price format");
			}
			return price;
		}),
	priceMax: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const price = parseFloat(val);
			if (isNaN(price)) {
				throw new Error("Invalid maximum price format");
			}
			return price;
		}),
});

// Type exports
export type CreateVoyageInput = z.infer<typeof createVoyageSchema>;
export type UpdateVoyageInput = z.infer<typeof updateVoyageSchema>;
export type GetVoyagesQuery = z.infer<typeof getVoyagesQuerySchema>;
export type Voyage = z.infer<typeof voyageSchema>;
