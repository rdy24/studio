import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { updateUserSchema, type UpdateUserInput } from "@/lib/schemas/user";
import {
	createValidationErrorResponse,
	createApiResponse,
	createErrorResponse,
} from "@/lib/utils/validation";

// GET /api/users/[id] - Get user by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				role: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		if (!user) {
			return createErrorResponse(
				"User not found",
				"The requested user could not be found",
				404
			);
		}

		// Transform data to match frontend interface
		const transformedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role.name,
			roleId: user.roleId,
			status: user.status,
			avatar: user.avatar,
			lastLogin: user.lastLogin,
			dateJoined: user.dateJoined,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return createApiResponse(
			transformedUser,
			"User retrieved successfully",
			200
		);
	} catch (error) {
		console.error("Error fetching user:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to fetch user",
			500
		);
	}
}

// PUT /api/users/[id] - Update user
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		const body = await request.json();
		const validatedData = updateUserSchema.parse(body);

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return createErrorResponse(
				"User not found",
				"The requested user could not be found",
				404
			);
		}

		// Check if email already exists (if email is being updated)
		if (validatedData.email && validatedData.email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email: validatedData.email },
			});

			if (emailExists) {
				return createErrorResponse(
					"Email already exists",
					"A user with this email already exists",
					409
				);
			}
		}

		// Verify role exists (if role is being updated)
		if (validatedData.roleId) {
			const role = await prisma.role.findUnique({
				where: { id: validatedData.roleId },
			});

			if (!role) {
				return createErrorResponse(
					"Invalid role",
					"The specified role does not exist",
					400
				);
			}
		}

		// Prepare update data
		const updateData: any = {};
		if (validatedData.name !== undefined)
			updateData.name = validatedData.name;
		if (validatedData.email !== undefined)
			updateData.email = validatedData.email;
		if (validatedData.roleId !== undefined)
			updateData.roleId = validatedData.roleId;
		if (validatedData.status !== undefined) {
			updateData.status = validatedData.status;
			// Update lastLogin if status is being set to Active
			if (
				validatedData.status === "Active" &&
				existingUser.status !== "Active"
			) {
				updateData.lastLogin = new Date();
			}
		}
		if (validatedData.avatar !== undefined)
			updateData.avatar = validatedData.avatar;

		// Update user
		const user = await prisma.user.update({
			where: { id },
			data: updateData,
			include: {
				role: {
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		});

		// Transform data to match frontend interface
		const transformedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role.name,
			roleId: user.roleId,
			status: user.status,
			avatar: user.avatar,
			lastLogin: user.lastLogin,
			dateJoined: user.dateJoined,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		return createApiResponse(
			transformedUser,
			"User updated successfully",
			200
		);
	} catch (error) {
		console.error("Error updating user:", error);

		if (error instanceof z.ZodError) {
			return createValidationErrorResponse(error);
		}

		return createErrorResponse(
			"Internal server error",
			"Failed to update user",
			500
		);
	}
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return createErrorResponse(
				"User not found",
				"The requested user could not be found",
				404
			);
		}

		// Check if user has any bookings (prevent deletion if they do)
		const userBookings = await prisma.booking.count({
			where: { userId: id },
		});

		if (userBookings > 0) {
			return createErrorResponse(
				"Cannot delete user",
				"User cannot be deleted because they have existing bookings",
				409
			);
		}

		// Delete user (this will cascade delete related records like activity logs and travel schedule participants)
		await prisma.user.delete({
			where: { id },
		});

		return createApiResponse(null, "User deleted successfully", 204);
	} catch (error) {
		console.error("Error deleting user:", error);

		return createErrorResponse(
			"Internal server error",
			"Failed to delete user",
			500
		);
	}
}
