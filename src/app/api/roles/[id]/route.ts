import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roleUpdateSchema } from "@/lib/validations/role";
import { handleApiError } from "@/lib/api-utils";

// Helper function to transform role for response
function transformRoleForResponse(role: any) {
	return {
		id: role.id.toString(),
		name: role.name,
		description: role.description,
		permissions: role.permissions.map((p: any) => p.permission.name),
	};
}

// GET /api/roles/[id] - Get a specific role
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid role ID" },
				{ status: 400 }
			);
		}

		const role = await prisma.role.findUnique({
			where: { id },
			include: {
				permissions: {
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
			return NextResponse.json(
				{ error: "Role not found" },
				{ status: 404 }
			);
		}

		// Transform role to match frontend format
		const transformedRole = transformRoleForResponse(role);

		return NextResponse.json(transformedRole);
	} catch (error) {
		console.error("GET /api/roles/[id] error:", error);
		return handleApiError(error);
	}
}

// PUT /api/roles/[id] - Update a role
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid role ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();

		// Validate request body
		const validatedData = roleUpdateSchema.parse(body);

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id },
		});

		if (!existingRole) {
			return NextResponse.json(
				{ error: "Role not found" },
				{ status: 404 }
			);
		}

		// Check if name is already taken by another role
		if (validatedData.name !== existingRole.name) {
			const nameExists = await prisma.role.findUnique({
				where: { name: validatedData.name },
			});

			if (nameExists) {
				return NextResponse.json(
					{ error: "Role name already exists" },
					{ status: 400 }
				);
			}
		}

		// Update role with permissions
		// First, delete existing permissions
		await prisma.rolePermission.deleteMany({
			where: { roleId: id },
		});

		// Then update role and add new permissions
		const updatedRole = await prisma.role.update({
			where: { id },
			data: {
				name: validatedData.name,
				description: validatedData.description,
				permissions: {
					create: validatedData.permissionIds.map((permissionId) => ({
						permission: {
							connect: { id: parseInt(permissionId) },
						},
					})),
				},
			},
			include: {
				permissions: {
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

		// Transform role to match frontend format
		const transformedRole = transformRoleForResponse(updatedRole);

		return NextResponse.json(transformedRole);
	} catch (error) {
		console.error("PUT /api/roles/[id] error:", error);
		return handleApiError(error);
	}
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid role ID" },
				{ status: 400 }
			);
		}

		// Check if role exists
		const existingRole = await prisma.role.findUnique({
			where: { id },
		});

		if (!existingRole) {
			return NextResponse.json(
				{ error: "Role not found" },
				{ status: 404 }
			);
		}

		// Check if role is in use by any users
		const usersWithRole = await prisma.user.count({
			where: { roleId: id },
		});

		if (usersWithRole > 0) {
			return NextResponse.json(
				{ error: "Cannot delete role that is assigned to users" },
				{ status: 400 }
			);
		}

		// Delete role
		await prisma.role.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "Role deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("DELETE /api/roles/[id] error:", error);
		return handleApiError(error);
	}
}
