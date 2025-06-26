import { z } from "zod";

// User validation schemas
export const createUserSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must not exceed 100 characters"),
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	roleId: z.string().min(1, "Role selection is required"),
	status: z
		.enum(["Active", "Inactive", "Pending"], {
			errorMap: () => ({
				message: "Status must be Active, Inactive, or Pending",
			}),
		})
		.default("Pending"),
	avatar: z
		.string()
		.url("Please enter a valid URL for avatar")
		.optional()
		.or(z.literal("")),
});

export const updateUserSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must not exceed 100 characters")
		.optional(),
	email: z.string().email("Please enter a valid email address").optional(),
	roleId: z.string().min(1, "Role selection is required").optional(),
	status: z
		.enum(["Active", "Inactive", "Pending"], {
			errorMap: () => ({
				message: "Status must be Active, Inactive, or Pending",
			}),
		})
		.optional(),
	avatar: z
		.string()
		.url("Please enter a valid URL for avatar")
		.optional()
		.nullable()
		.or(z.literal("")),
});

export const getUsersQuerySchema = z.object({
	page: z
		.string()
		.nullable()
		.optional()
		.transform((val) => {
			if (!val) return 1;
			const parsed = parseInt(val);
			if (isNaN(parsed) || parsed < 1) {
				throw new Error("Page must be a positive number");
			}
			return parsed;
		}),
	limit: z
		.string()
		.nullable()
		.optional()
		.transform((val) => {
			if (!val) return 10;
			const parsed = parseInt(val);
			if (isNaN(parsed) || parsed < 1 || parsed > 100) {
				throw new Error("Limit must be between 1 and 100");
			}
			return parsed;
		}),
	search: z
		.string()
		.nullable()
		.optional()
		.transform((val) => val || undefined),
	status: z.enum(["Active", "Inactive", "Pending"]).nullable().optional(),
	roleId: z
		.string()
		.nullable()
		.optional()
		.transform((val) => val || undefined),
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
