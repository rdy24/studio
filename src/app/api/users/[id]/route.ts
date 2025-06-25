import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations/user";
import { handleApiError, transformUserForResponse } from "@/lib/api-utils";

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

// GET /api/users/[id] - Get a specific user
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}
		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		// Transform user to match frontend format
		const transformedUser: UserResponse = transformUserForResponse(user);
		return NextResponse.json(transformedUser);
	} catch (error: any) {
		console.error("GET /api/users/[id] error:", error?.message || error);
		return handleApiError(error);
	}
}

// PUT /api/users/[id] - Update a user
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}
		const body = await request.json();
		// Validate request body
		const validatedData = userUpdateSchema.parse(body);
		let updateData: any = {
			name: validatedData.name,
			email: validatedData.email,
			status: validatedData.status,
			roleId: validatedData.roleId,
			avatarUrl: validatedData.avatarUrl ?? null,
		};
		if (validatedData.password) {
			updateData.passwordHash = await bcrypt.hash(
				validatedData.password,
				10
			);
		}
		const user = await prisma.user.update({
			where: { id },
			data: updateData,
			include: {
				role: {
					select: { name: true },
				},
			},
		});
		// Transform user to match frontend format
		const transformedUser: UserResponse = transformUserForResponse(user);
		return NextResponse.json(transformedUser);
	} catch (error: any) {
		console.error("PUT /api/users/[id] error:", error?.message || error);
		return handleApiError(error);
	}
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Delete user
		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "User deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		return handleApiError(error);
	}
}
