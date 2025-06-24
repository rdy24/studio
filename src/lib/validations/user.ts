import { z } from "zod";

// Schema for user creation validation
export const userCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.optional(),
	roleId: z.number().int().positive("Role ID is required"),
	status: z.enum(["Active", "Inactive", "Pending"]),
	avatarUrl: z.string().url().optional().nullable(),
});

// Schema for user update validation
export const userUpdateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.optional(),
	roleId: z.number().int().positive("Role ID is required"),
	status: z.enum(["Active", "Inactive", "Pending"]),
	avatarUrl: z.string().url().optional().nullable(),
});

// Types inferred from schemas
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
