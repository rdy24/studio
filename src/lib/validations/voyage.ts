import * as z from "zod";

export const voyageSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	start_date: z.string().nullable(),
	end_date: z.string().nullable(),
	price: z.number().min(0, "Price must be a positive number"),
	status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"]),
	description: z.string().nullable(),
	image_url: z.string().nullable(),
	destination_ids: z
		.array(z.number())
		.min(1, "At least one destination is required"),
});

export const voyageUpdateSchema = voyageSchema.partial();

export type VoyageFormValues = z.infer<typeof voyageSchema>;
export type VoyageUpdateFormValues = z.infer<typeof voyageUpdateSchema>;
