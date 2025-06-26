import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
	try {
		console.log("=== GET /api/roles - Starting ===");

		const roles = await prisma.role.findMany({
			orderBy: { createdAt: "desc" },
		});

		console.log("Roles found:", roles.length);

		// Transform data to match frontend interface
		const transformedRoles = roles.map((role) => ({
			id: role.id,
			name: role.name,
			description: role.description,
			permissions: [], // For now, return empty permissions array
			createdAt: role.createdAt,
			updatedAt: role.updatedAt,
		}));

		console.log("=== GET /api/roles - Success ===");
		return NextResponse.json({
			data: transformedRoles,
			error: null,
			message: "Roles retrieved successfully",
			statusCode: 200,
		});
	} catch (error) {
		console.error("=== GET /api/roles - Error ===");
		console.error("Error fetching roles:", error);

		return NextResponse.json(
			{
				data: null,
				error: "Internal server error",
				message: "Failed to fetch roles",
				statusCode: 500,
			},
			{ status: 500 }
		);
	}
}
