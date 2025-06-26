import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schemas
const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	roleId: z.string().min(1, "Role ID is required"),
	status: z.enum(["Active", "Inactive", "Pending"]).default("Pending"),
	avatar: z.string().url().optional(),
});

const getUsersQuerySchema = z.object({
	page: z
		.string()
		.nullable()
		.optional()
		.transform((val) => (val ? parseInt(val) : 1)),
	limit: z
		.string()
		.nullable()
		.optional()
		.transform((val) => (val ? parseInt(val) : 10)),
	search: z.string().nullable().optional(),
	status: z.enum(["Active", "Inactive", "Pending"]).nullable().optional(),
	roleId: z.string().nullable().optional(),
});

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

		return NextResponse.json({
			data: transformedUsers,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
			error: null,
			message: "Users retrieved successfully",
			statusCode: 200,
		});
	} catch (error) {
		console.error("Error fetching users:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					data: null,
					error: "Validation failed",
					message: error.errors.map((e) => e.message).join(", "),
					statusCode: 422,
				},
				{ status: 422 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to fetch users",
				statusCode: 500,
			},
			{ status: 500 }
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
			return NextResponse.json(
				{
					data: null,
					error: "Email already exists",
					message: "A user with this email already exists",
					statusCode: 409,
				},
				{ status: 409 }
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
			return NextResponse.json(
				{
					data: null,
					error: "Invalid role",
					message: "The specified role does not exist",
					statusCode: 400,
				},
				{ status: 400 }
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
		return NextResponse.json(
			{
				data: transformedUser,
				error: null,
				message: "User created successfully",
				statusCode: 201,
			},
			{ status: 201 }
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
			return NextResponse.json(
				{
					data: null,
					error: "Validation failed",
					message: error.errors.map((e) => e.message).join(", "),
					statusCode: 422,
				},
				{ status: 422 }
			);
		}

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to create user",
				statusCode: 500,
			},
			{ status: 500 }
		);
	}
}
