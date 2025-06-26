import { CreateRoleInput, UpdateRoleInput, Role } from "@/lib/schemas/role";
import { ApiResponse, PaginatedResponse } from "@/types";

const API_BASE_URL = "/api/roles";

export interface GetRolesParams {
	page?: number;
	limit?: number;
	search?: string;
}

/**
 * Get all roles with pagination and filtering
 */
export async function getRoles(
	params: GetRolesParams = {}
): Promise<PaginatedResponse<Role>> {
	const searchParams = new URLSearchParams();

	if (params.page) searchParams.append("page", params.page.toString());
	if (params.limit) searchParams.append("limit", params.limit.toString());
	if (params.search) searchParams.append("search", params.search);

	const url = `${API_BASE_URL}?${searchParams.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch roles: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Get a single role by ID
 */
export async function getRole(id: string): Promise<ApiResponse<Role>> {
	const response = await fetch(`${API_BASE_URL}/${id}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch role: ${response.statusText}`);
	}

	return response.json();
}

/**
 * Create a new role
 */
export async function createRole(
	data: CreateRoleInput
): Promise<ApiResponse<Role>> {
	const response = await fetch(API_BASE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to create role");
	}

	return response.json();
}

/**
 * Update an existing role
 */
export async function updateRole(
	id: string,
	data: UpdateRoleInput
): Promise<ApiResponse<Role>> {
	const response = await fetch(`${API_BASE_URL}/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to update role");
	}

	return response.json();
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to delete role");
	}
}
