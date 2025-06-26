import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
	createRoleSchema,
	getRolesQuerySchema,
	type CreateRoleInput,
	type GetRolesQuery,
} from "@/lib/schemas/role";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";

// GET /api/roles - Get all roles with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		console.log("=== GET /api/roles - Starting ===");

		const { searchParams } = new URL(request.url);
		const query = getRolesQuerySchema.parse({
			page: searchParams.get("page") || undefined,
			limit: searchParams.get("limit") || undefined,
			search: searchParams.get("search") || undefined,
		});

		const { page, limit, search } = query;
		const skip = (page - 1) * limit;

		// Build where clause for filtering
		const where: any = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		// Get roles with pagination
		const [roles, total] = await Promise.all([
			prisma.role.findMany({
				where,
				include: {
					rolePermissions: {
						include: {
							permission: {
								select: {
									name: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.role.count({ where }),
		]);

		console.log("Roles found:", roles.length);

		// Transform data to match frontend interface
		const transformedRoles = roles.map((role) => ({
			id: role.id,
			name: role.name,
			description: role.description,
			permissions: role.rolePermissions.map((rp) => rp.permission.name),
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		}));

		const totalPages = Math.ceil(total / limit);

		console.log("=== GET /api/roles - Success ===");
		return createApiResponse(
			{
				data: transformedRoles,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			},
			"Roles retrieved successfully",
			200
		);
	} catch (error) {
		console.error("=== GET /api/roles - Error ===");
		console.error("Error fetching roles:", error);

		if (error instanceof z.ZodError) {
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch roles",
			500
		);
	}
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
	try {
		console.log("=== POST /api/roles - Starting ===");

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = createRoleSchema.parse(body);
		console.log("Validated data:", validatedData);

		// Check if role name already exists
		console.log("Checking if role name exists:", validatedData.name);
		const existingRole = await prisma.role.findUnique({
			where: { name: validatedData.name },
		});
		console.log(
			"Existing role check result:",
			existingRole ? "Found" : "Not found"
		);

		if (existingRole) {
			return createErrorResponse(
				"Role name already exists",
				"A role with this name already exists",
				409
			);
		}

		// Verify permissions exist
		if (validatedData.permissions && validatedData.permissions.length > 0) {
			console.log(
				"Checking if permissions exist:",
				validatedData.permissions
			);
			const existingPermissions = await prisma.permission.findMany({
				where: {
					name: {
						in: validatedData.permissions,
					},
				},
			});

			const existingPermissionNames = existingPermissions.map(
				(p) => p.name
			);
			const missingPermissions = validatedData.permissions.filter(
				(permission) => !existingPermissionNames.includes(permission)
			);

			if (missingPermissions.length > 0) {
				console.log("Missing permissions:", missingPermissions);
				return createErrorResponse(
					"Invalid permissions",
					`The following permissions do not exist: ${missingPermissions.join(
						", "
					)}`,
					400
				);
			}
		}

		// Create role
		console.log("Creating role with data:", {
			name: validatedData.name,
			description: validatedData.description,
		});

		const role = await prisma.role.create({
			data: {
				name: validatedData.name,
				description: validatedData.description,
			},
		});
		console.log("Role created successfully:", role.id);

		// Create role permissions if provided
		if (validatedData.permissions && validatedData.permissions.length > 0) {
			console.log(
				"Creating role permissions:",
				validatedData.permissions
			);

			const permissions = await prisma.permission.findMany({
				where: {
					name: {
						in: validatedData.permissions,
					},
				},
			});

			const rolePermissionData = permissions.map((permission) => ({
				roleId: role.id,
				permissionId: permission.id,
			}));

			await prisma.rolePermission.createMany({
				data: rolePermissionData,
			});
			console.log("Role permissions created successfully");
		}

		// Fetch the created role with permissions
		const createdRole = await prisma.role.findUnique({
			where: { id: role.id },
			include: {
				rolePermissions: {
					include: {
						permission: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		// Transform data to match frontend interface
		const transformedRole = {
			id: createdRole!.id,
			name: createdRole!.name,
			description: createdRole!.description,
			permissions: createdRole!.rolePermissions.map(
				(rp) => rp.permission.name
			),
			createdAt: createdRole!.createdAt,
			updatedAt: createdRole!.updatedAt,
		};

		console.log("=== POST /api/roles - Success ===");
		return createApiResponse(
			transformedRole,
			"Role created successfully",
			201
		);
	} catch (error) {
		console.error("=== POST /api/roles - Error ===");
		console.error("Error creating role:", error);
		console.error(
			"Error stack:",
			error instanceof Error ? error.stack : "No stack trace"
		);

		if (error instanceof z.ZodError) {
			console.error("Zod validation errors:", error.errors);
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to create role",
			500
		);
	}
}
