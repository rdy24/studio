import type { Role } from "@/types";

// Type for role creation input
export interface RoleCreateInput {
	name: string;
	description?: string | null;
	permissionIds: string[];
}

// Type for role update input
export interface RoleUpdateInput {
	name: string;
	description?: string | null;
	permissionIds: string[];
}

// Fetch all roles
export async function fetchRoles(): Promise<{
	data: Role[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}> {
	const response = await fetch("/api/roles");

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to fetch roles"
		);
	}

	return await response.json();
}

// Create a new role
export async function createRole(roleData: RoleCreateInput): Promise<Role> {
	const response = await fetch("/api/roles", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: roleData.name,
			description: roleData.description,
			permissionIds: roleData.permissionIds,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to create role"
		);
	}

	const newRole = await response.json();
	return formatRoleResponse(newRole);
}

// Update an existing role
export async function updateRole(
	roleId: string,
	roleData: RoleUpdateInput
): Promise<Role> {
	const response = await fetch(`/api/roles/${roleId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: roleData.name,
			description: roleData.description,
			permissionIds: roleData.permissionIds,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to update role"
		);
	}

	const updatedRole = await response.json();
	return formatRoleResponse(updatedRole);
}

// Delete a role
export async function deleteRole(roleId: string): Promise<boolean> {
	const response = await fetch(`/api/roles/${roleId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to delete role"
		);
	}

	return true;
}

// Helper function to format role response
function formatRoleResponse(role: any): Role {
	return {
		id: role.id.toString(),
		name: role.name,
		description: role.description || "",
		permissions: role.permissions || [],
	};
}
