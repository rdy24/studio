import { z } from "zod";

// Schema for role creation validation
export const roleCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional().nullable(),
	permissionIds: z
		.array(z.string())
		.min(1, "At least one permission is required"),
});

// Schema for role update validation
export const roleUpdateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional().nullable(),
	permissionIds: z
		.array(z.string())
		.min(1, "At least one permission is required"),
});

// Types inferred from schemas
export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
