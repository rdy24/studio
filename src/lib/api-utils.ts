import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { User } from "@prisma/client";

// Error handling utility
export function handleApiError(error: unknown) {
	console.error("API Error:", error);

	if (error instanceof ZodError) {
		const errorMessages = error.errors
			.map((err) => `${err.path.join(".")}: ${err.message}`)
			.join(", ");
		return NextResponse.json({ error: errorMessages }, { status: 400 });
	}

	return NextResponse.json(
		{ error: "An unexpected error occurred" },
		{ status: 500 }
	);
}

// User transformation utility
export function transformUserForResponse(
	user: User & { role: { name: string } }
) {
	return {
		id: user.id.toString(),
		name: user.name,
		email: user.email,
		role: user.role.name,
		roleId: user.roleId,
		status: user.status,
		avatar: user.avatarUrl,
		lastLogin: user.lastLogin,
		dateJoined: user.dateJoined,
	};
}

// Pagination utility
export function getPaginationParams(searchParams: URLSearchParams) {
	const page = parseInt(searchParams.get("page") || "1");
	const perPage = parseInt(searchParams.get("per_page") || "10");
	const skip = (page - 1) * perPage;

	return { page, perPage, skip };
}
