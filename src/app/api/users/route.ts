import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
	createUserSchema,
	getUsersQuerySchema,
	type CreateUserInput,
	type GetUsersQuery,
} from "@/lib/schemas/user";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";

// GET /api/users - Get all users with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = getUsersQuerySchema.parse({
			page: searchParams.get("page"),
			limit: searchParams.get("limit"),
			search: searchParams.get("search"),
			status: searchParams.get("status"),
			roleId: searchParams.get("roleId"),
		});

		const { page, limit, search, status, roleId } = query;
		const skip = (page - 1) * limit;

		// Build where clause for filtering
		const where: any = {};

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
				{ role: { name: { contains: search, mode: "insensitive" } } },
			];
		}

		if (status) {
			where.status = status;
		}

		if (roleId) {
			where.roleId = parseInt(roleId);
		}

		// Get users with pagination
		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				include: {
					role: {
						select: {
							id: true,
							name: true,
							description: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.user.count({ where }),
		]);

		// Transform data to match frontend interface
		const transformedUsers = users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role.name,
			roleId: user.roleId.toString(), // Convert to string for frontend
			status: user.status,
			avatar: user.avatar,
			lastLogin: user.lastLogin,
			dateJoined: user.dateJoined,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}));

		const totalPages = Math.ceil(total / limit);

		return createApiResponse(
			{
				data: transformedUsers,
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			},
			"Users retrieved successfully",
			200
		);
	} catch (error) {
		console.error("Error fetching users:", error);

		if (error instanceof z.ZodError) {
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch users",
			500
		);
	}
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
	try {
		console.log("=== POST /api/users - Starting ===");

		const body = await request.json();
		console.log("Request body:", body);

		const validatedData = createUserSchema.parse(body);
		console.log("Validated data:", validatedData);

		// Check if email already exists
		console.log("Checking if email exists:", validatedData.email);
		const existingUser = await prisma.user.findUnique({
			where: { email: validatedData.email },
		});
		console.log(
			"Existing user check result:",
			existingUser ? "Found" : "Not found"
		);

		if (existingUser) {
			return createErrorResponse(
				"Email already exists",
				"A user with this email already exists",
				409
			);
		}

		// Verify role exists
		console.log("Checking if role exists:", validatedData.roleId);
		const role = await prisma.role.findUnique({
			where: { id: validatedData.roleId.toString() },
		});
		console.log(
			"Role check result:",
			role ? `Found: ${role.name}` : "Not found"
		);

		if (!role) {
			return createErrorResponse(
				"Invalid role",
				"The specified role does not exist",
				400
			);
		}

		// Create user
		console.log("Creating user with data:", {
			name: validatedData.name,
			email: validatedData.email,
			roleId: validatedData.roleId,
			status: validatedData.status,
			avatar: validatedData.avatar,
		});

		const user = await prisma.user.create({
			data: {
				name: validatedData.name,
				email: validatedData.email,
				roleId: validatedData.roleId.toString(),
				status: validatedData.status,
				avatar: validatedData.avatar,
				dateJoined: new Date(),
			},
		});
		console.log("User created successfully:", user.id);

		// Transform data to match frontend interface
		const transformedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: role.name, // Use role from previous query
			roleId: user.roleId.toString(), // Convert to string for frontend
			status: user.status,
			avatar: user.avatar,
			lastLogin: user.lastLogin,
			dateJoined: user.dateJoined,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		console.log("=== POST /api/users - Success ===");
		return createApiResponse(
			transformedUser,
			"User created successfully",
			201
		);
	} catch (error) {
		console.error("=== POST /api/users - Error ===");
		console.error("Error creating user:", error);
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
			"Failed to create user",
			500
		);
	}
}
