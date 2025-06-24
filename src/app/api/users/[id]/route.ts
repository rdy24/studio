import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations/user";
import { handleApiError, transformUserForResponse } from "@/lib/api-utils";

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
		const transformedUser = transformUserForResponse(user);

		return NextResponse.json(transformedUser);
	} catch (error) {
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

		// Check if email is already taken by another user
		if (validatedData.email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email: validatedData.email },
			});

			if (emailExists) {
				return NextResponse.json(
					{ error: "Email already exists" },
					{ status: 400 }
				);
			}
		}

		// Prepare update data
		const updateData: any = {
			name: validatedData.name,
			email: validatedData.email,
			roleId: validatedData.roleId,
			status: validatedData.status,
			avatarUrl: validatedData.avatarUrl,
			// Update lastLogin if status changed to Active
			...(validatedData.status === "Active" &&
			existingUser.status !== "Active"
				? { lastLogin: new Date() }
				: {}),
		};

		// Hash password if provided
		if (validatedData.password) {
			updateData.passwordHash = await bcrypt.hash(
				validatedData.password,
				10
			);
		}

		// Update user
		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			include: {
				role: {
					select: {
						name: true,
					},
				},
			},
		});

		// Transform user to match frontend format
		const transformedUser = transformUserForResponse(updatedUser);

		return NextResponse.json(transformedUser);
	} catch (error) {
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
