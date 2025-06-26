import { z } from "zod";

export const destinationSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Destination name is required"),
	country: z.string().min(1, "Country is required"),
	description: z.string().nullable().optional(),
	imageUrl: z.string().url("Invalid URL format").nullable().optional(),
	created_at: z.string().datetime().optional(),
	updated_at: z.string().datetime().optional(),
});

export const createDestinationSchema = destinationSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const updateDestinationSchema = destinationSchema
	.omit({
		id: true,
		created_at: true,
		updated_at: true,
	})
	.partial();

export type Destination = z.infer<typeof destinationSchema>;
export type CreateDestinationRequest = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationRequest = z.infer<typeof updateDestinationSchema>;
