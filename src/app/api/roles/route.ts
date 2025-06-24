import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roleCreateSchema } from "@/lib/validations/role";
import { handleApiError, getPaginationParams } from "@/lib/api-utils";

// Helper function to transform role for response
function transformRoleForResponse(role: any) {
	return {
		id: role.id.toString(),
		name: role.name,
		description: role.description,
		permissions: role.permissions.map((p: any) => p.permission.name),
	};
}

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const { page, perPage, skip } = getPaginationParams(searchParams);

		// Build filter conditions
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
				skip,
				take: perPage,
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.role.count({ where }),
		]);

		// Transform roles to match frontend format
		const transformedRoles = roles.map(transformRoleForResponse);

		return NextResponse.json({
			data: transformedRoles,
			total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(total / perPage),
		});
	} catch (error) {
		console.error("POST /api/roles error:", error);
		return handleApiError(error);
	}
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = roleCreateSchema.parse(body);

		// Check if role name already exists
		const existingRole = await prisma.role.findUnique({
			where: { name: validatedData.name },
		});

		if (existingRole) {
			return NextResponse.json(
				{ error: "Role name already exists" },
				{ status: 400 }
			);
		}

		// Create role with permissions
		const role = await prisma.role.create({
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
		const transformedRole = transformRoleForResponse(role);

		return NextResponse.json(transformedRole, { status: 201 });
	} catch (error) {
		console.error("POST /api/roles error:", error);
		return handleApiError(error);
	}
}
