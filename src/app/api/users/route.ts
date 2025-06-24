import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { userCreateSchema } from "@/lib/validations/user";
import {
	handleApiError,
	transformUserForResponse,
	getPaginationParams,
} from "@/lib/api-utils";

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
		const where: any = {};

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
		const transformedUsers = users.map(transformUserForResponse);

		return NextResponse.json({
			data: transformedUsers,
			total,
			page,
			per_page: perPage,
			total_pages: Math.ceil(total / perPage),
		});
	} catch (error) {
		return handleApiError(error);
	}
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = userCreateSchema.parse(body);

		// Check if email already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 }
			);
		}

		// Hash password with bcrypt
		const passwordHash = await bcrypt.hash(
			validatedData.password || "defaultpassword",
			10
		);

		// Create user
		const user = await prisma.user.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				passwordHash,
				roleId: validatedData.roleId,
				status: validatedData.status,
				avatarUrl: validatedData.avatarUrl || null,
				dateJoined: new Date(),
			},
			include: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});

		// Transform user to match frontend format
		const transformedUser = transformUserForResponse(user);

		return NextResponse.json(transformedUser, { status: 201 });
	} catch (error) {
		return handleApiError(error);
	}
}
