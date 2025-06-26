import { z } from "zod";

// Base role schema
export const roleSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	permissions: z.array(z.string()).default([]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create role request schema
export const createRoleSchema = z.object({
	name: z
		.string()
		.min(1, "Role name is required")
		.max(100, "Role name must be less than 100 characters")
		.trim(),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.trim()
		.optional()
		.nullable(),
	permissions: z
		.array(z.string())
		.default([])
		.refine(
			(permissions) => {
				const validPermissions = [
					"manage_users",
					"manage_roles",
					"manage_voyages",
					"manage_destinations",
					"manage_bookings",
					"manage_schedules",
					"view_reports",
					"view_bookings",
					"manage_support_tickets",
				];
				return permissions.every((permission) =>
					validPermissions.includes(permission)
				);
			},
			{
				message: "Invalid permission provided",
			}
		),
});

// Update role request schema
export const updateRoleSchema = z.object({
	name: z
		.string()
		.min(1, "Role name is required")
		.max(100, "Role name must be less than 100 characters")
		.trim()
		.optional(),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.trim()
		.optional()
		.nullable(),
	permissions: z
		.array(z.string())
		.refine(
			(permissions) => {
				const validPermissions = [
					"manage_users",
					"manage_roles",
					"manage_voyages",
					"manage_destinations",
					"manage_bookings",
					"manage_schedules",
					"view_reports",
					"view_bookings",
					"manage_support_tickets",
				];
				return permissions.every((permission) =>
					validPermissions.includes(permission)
				);
			},
			{
				message: "Invalid permission provided",
			}
		)
		.optional(),
});

// Query parameters schema for GET requests
export const getRolesQuerySchema = z.object({
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
});

// Type exports
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type GetRolesQuery = z.infer<typeof getRolesQuerySchema>;
export type Role = z.infer<typeof roleSchema>;
