import { z } from "zod";

// Schema for destination creation validation
export const destinationCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	country: z.string().min(1, "Country is required"),
	description: z.string().optional().nullable(),
	imageUrl: z.string().url("Invalid URL").optional().nullable(),
});

// Schema for destination update validation
export const destinationUpdateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	country: z.string().min(1, "Country is required"),
	description: z.string().optional().nullable(),
	imageUrl: z.string().url("Invalid URL").optional().nullable(),
});

// Types inferred from schemas
export type DestinationCreateInput = z.infer<typeof destinationCreateSchema>;
export type DestinationUpdateInput = z.infer<typeof destinationUpdateSchema>;
