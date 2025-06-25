import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roleCreateSchema } from "@/lib/validations/role";
import { handleApiError, getPaginationParams } from "@/lib/api-utils";

// Types for Role response
interface RoleResponse {
	id: string;
	name: string;
	description?: string;
	permissions: string[];
}

// Helper function to transform role for response
function transformRoleForResponse(role: any): RoleResponse {
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
		const where: Record<string, any> = {};

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
								select: { name: true },
							},
						},
					},
				},
				skip,
				take: perPage,
				orderBy: { createdAt: "desc" },
			}),
			prisma.role.count({ where }),
		]);

		// Transform roles to match frontend format
		const transformedRoles: RoleResponse[] = roles.map(
			transformRoleForResponse
		);

		return NextResponse.json({
			data: transformedRoles,
			total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(total / perPage),
		});
	} catch (error: any) {
		console.error("GET /api/roles error:", error?.message || error);
		return handleApiError(error);
	}
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = roleCreateSchema.parse(body);

		// Create role
		const role = await prisma.role.create({
			data: {
				name: validatedData.name,
				description: validatedData.description,
			},
			include: {
				permissions: {
					include: {
						permission: { select: { name: true } },
					},
				},
			},
		});

		// Transform role to match frontend format
		const transformedRole: RoleResponse = transformRoleForResponse(role);

		return NextResponse.json(transformedRole, { status: 201 });
	} catch (error: any) {
		console.error("POST /api/roles error:", error?.message || error);
		return handleApiError(error);
	}
}
