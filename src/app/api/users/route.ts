import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { userCreateSchema } from "@/lib/validations/user";
import {
	handleApiError,
	transformUserForResponse,
	getPaginationParams,
} from "@/lib/api-utils";

// Types for User response (matches transformUserForResponse)
interface UserResponse {
	id: string;
	name: string;
	email: string;
	role: string;
	roleId: number;
	status: string;
	avatar: string | null;
	lastLogin: Date | null;
	dateJoined: Date;
}

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status");
		const roleId = searchParams.get("roleId")
			? parseInt(searchParams.get("roleId")!)
			: undefined;
		const { page, perPage, skip } = getPaginationParams(searchParams);

		// Build filter conditions
		const where: Record<string, any> = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			];
		}

		if (status) {
			where.status = status;
		}

		if (roleId) {
			where.roleId = roleId;
		}

		// Get users with pagination
		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				include: {
					role: {
						select: {
							name: true,
						},
					},
				},
				skip,
				take: perPage,
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.user.count({ where }),
		]);

		// Transform users to match frontend format
		const transformedUsers: UserResponse[] = users.map(
			transformUserForResponse
		);

		return NextResponse.json({
			data: transformedUsers,
			total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(total / perPage),
		});
	} catch (error: any) {
		console.error("GET /api/users error:", error?.message || error);
		return handleApiError(error);
	}
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		// Validate request body
		const validatedData = userCreateSchema.parse(body);
		if (!validatedData.password) {
			return NextResponse.json(
				{ error: "Password is required" },
				{ status: 400 }
			);
		}
		// Hash password
		const hashedPassword = await bcrypt.hash(validatedData.password, 10);
		// Create user
		const user = await prisma.user.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				passwordHash: hashedPassword,
				status: validatedData.status,
				roleId: validatedData.roleId,
				avatarUrl: validatedData.avatarUrl ?? null,
			},
			include: {
				role: {
					select: { name: true },
				},
			},
		});
		// Transform user to match frontend format
		const transformedUser = transformUserForResponse(user);
		return NextResponse.json(transformedUser, { status: 201 });
	} catch (error: any) {
		console.error("POST /api/users error:", error?.message || error);
		return handleApiError(error);
	}
}
