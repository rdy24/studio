import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { updateRoleSchema, type UpdateRoleInput } from "@/lib/schemas/role";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";

// GET /api/roles/[id] - Get role by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== GET /api/roles/[id] - Starting ===");
		console.log("Role ID:", params.id);

		const role = await prisma.role.findUnique({
			where: { id: params.id },
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

		if (!role) {
			console.log("Role not found");
			return createErrorResponse(
				"Role not found",
				"The specified role does not exist",
				404
			);
		}

		// Transform data to match frontend interface
		const transformedRole = {
			id: role.id,
			name: role.name,
			description: role.description,
			permissions: role.rolePermissions.map((rp) => rp.permission.name),
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		};

		console.log("=== GET /api/roles/[id] - Success ===");
		return createApiResponse(
			transformedRole,
			"Role retrieved successfully",
			200
		);
	} catch (error) {
		console.error("=== GET /api/roles/[id] - Error ===");
		console.error("Error fetching role:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch role",
			500
		);
	}
}

// PUT /api/roles/[id] - Update role
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== PUT /api/roles/[id] - Starting ===");
		console.log("Role ID:", params.id);

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = updateRoleSchema.parse(body);
		console.log("Validated data:", validatedData);

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id: params.id },
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

		if (!existingRole) {
			return createErrorResponse(
				"Role not found",
				"The specified role does not exist",
				404
			);
		}

		// Check if new name already exists (if name is being updated)
		if (validatedData.name && validatedData.name !== existingRole.name) {
			console.log(
				"Checking if new role name exists:",
				validatedData.name
			);
			const roleWithSameName = await prisma.role.findUnique({
				where: { name: validatedData.name },
			});

			if (roleWithSameName) {
				return createErrorResponse(
					"Role name already exists",
					"A role with this name already exists",
					409
				);
			}
		}

		// Verify permissions exist (if permissions are being updated)
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

		// Update role
		console.log("Updating role with data:", {
			name: validatedData.name,
			description: validatedData.description,
		});

		const updatedRole = await prisma.role.update({
			where: { id: params.id },
			data: {
				...(validatedData.name && { name: validatedData.name }),
				...(validatedData.description !== undefined && {
					description: validatedData.description,
				}),
			},
		});
		console.log("Role updated successfully:", updatedRole.id);

		// Update role permissions if provided
		if (validatedData.permissions !== undefined) {
			console.log(
				"Updating role permissions:",
				validatedData.permissions
			);

			// Delete existing role permissions
			await prisma.rolePermission.deleteMany({
				where: { roleId: params.id },
			});

			// Create new role permissions if any
			if (validatedData.permissions.length > 0) {
				const permissions = await prisma.permission.findMany({
					where: {
						name: {
							in: validatedData.permissions,
						},
					},
				});

				const rolePermissionData = permissions.map((permission) => ({
					roleId: params.id,
					permissionId: permission.id,
				}));

				await prisma.rolePermission.createMany({
					data: rolePermissionData,
				});
			}
			console.log("Role permissions updated successfully");
		}

		// Fetch the updated role with permissions
		const roleWithPermissions = await prisma.role.findUnique({
			where: { id: params.id },
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
			id: roleWithPermissions!.id,
			name: roleWithPermissions!.name,
			description: roleWithPermissions!.description,
			permissions: roleWithPermissions!.rolePermissions.map(
				(rp) => rp.permission.name
			),
			createdAt: roleWithPermissions!.createdAt,
			updatedAt: roleWithPermissions!.updatedAt,
		};

		console.log("=== PUT /api/roles/[id] - Success ===");
		return createApiResponse(
			transformedRole,
			"Role updated successfully",
			200
		);
	} catch (error) {
		console.error("=== PUT /api/roles/[id] - Error ===");
		console.error("Error updating role:", error);
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
			"Failed to update role",
			500
		);
	}
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log("=== DELETE /api/roles/[id] - Starting ===");
		console.log("Role ID:", params.id);

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id: params.id },
		});

		if (!existingRole) {
			return createErrorResponse(
				"Role not found",
				"The specified role does not exist",
				404
			);
		}

		// Check if role is assigned to any users
		const usersWithRole = await prisma.user.count({
			where: { roleId: params.id },
		});

		if (usersWithRole > 0) {
			console.log("Role is assigned to users, cannot delete");
			return createErrorResponse(
				"Role cannot be deleted",
				"This role is assigned to users and cannot be deleted",
				409
			);
		}

		// Delete role permissions first (cascade should handle this, but being explicit)
		await prisma.rolePermission.deleteMany({
			where: { roleId: params.id },
		});

		// Delete role
		await prisma.role.delete({
			where: { id: params.id },
		});

		console.log("Role deleted successfully");
		console.log("=== DELETE /api/roles/[id] - Success ===");
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("=== DELETE /api/roles/[id] - Error ===");
		console.error("Error deleting role:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to delete role",
			500
		);
	}
}
