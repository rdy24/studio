import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Format Zod validation errors into a user-friendly format
 */
export function formatZodErrors(error: z.ZodError): {
	message: string;
	details: Array<{ field: string; message: string }>;
} {
	const details = error.errors.map((err) => ({
		field: err.path.join("."),
		message: err.message,
	}));

	const message =
		details.length === 1
			? details[0].message
			: `Validation failed: ${details.map((d) => d.message).join(", ")}`;

	return { message, details };
}

/**
 * Create a standardized validation error response
 */
export function createValidationErrorResponse(error: z.ZodError) {
	const { message, details } = formatZodErrors(error);

	return NextResponse.json(
		{
			data: null,
			error: "Validation failed",
			message,
			details,
			statusCode: 422,
		},
		{ status: 422 }
	);
}

/**
 * Create a standardized API response
 */
export function createApiResponse(
	data: any,
	message: string,
	statusCode: number = 200,
	error: string | null = null
) {
	return NextResponse.json(
		{
			data,
			error,
			message,
			statusCode,
		},
		{ status: statusCode }
	);
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
	error: string,
	message: string,
	statusCode: number = 500
) {
	return NextResponse.json(
		{
			data: null,
			error,
			message,
			statusCode,
		},
		{ status: statusCode }
	);
}
