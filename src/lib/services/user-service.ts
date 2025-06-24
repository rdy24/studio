import type { User } from "@/types";

// Type for user creation input
export interface UserCreateInput {
	name: string;
	email: string;
	password?: string;
	roleId: number;
	status: "Active" | "Inactive" | "Pending";
	avatar?: string;
}

// Type for user update input
export interface UserUpdateInput {
	name: string;
	email: string;
	password?: string;
	roleId: number;
	status: "Active" | "Inactive" | "Pending";
	avatar?: string;
}

// Fetch all users
export async function fetchUsers(): Promise<{
	data: User[];
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
}> {
	const response = await fetch("/api/users");

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to fetch users"
		);
	}

	return await response.json();
}

// Create a new user
export async function createUser(userData: UserCreateInput): Promise<User> {
	const response = await fetch("/api/users", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: userData.name,
			email: userData.email,
			password: userData.password,
			roleId: userData.roleId,
			status: userData.status,
			avatarUrl: userData.avatar,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to create user"
		);
	}

	const newUser = await response.json();
	return formatUserResponse(newUser);
}

// Update an existing user
export async function updateUser(
	userId: string,
	userData: UserUpdateInput
): Promise<User> {
	const response = await fetch(`/api/users/${userId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: userData.name,
			email: userData.email,
			password: userData.password,
			roleId: userData.roleId,
			status: userData.status,
			avatarUrl: userData.avatar,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to update user"
		);
	}

	const updatedUser = await response.json();
	return formatUserResponse(updatedUser);
}

// Delete a user
export async function deleteUser(userId: string): Promise<boolean> {
	const response = await fetch(`/api/users/${userId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			typeof errorData.error === "string"
				? errorData.error
				: "Failed to delete user"
		);
	}

	return true;
}

// Helper function to format user response
function formatUserResponse(user: any): User {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		status: user.status,
		avatar: user.avatar,
		lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
		dateJoined: user.dateJoined ? new Date(user.dateJoined) : undefined,
	};
}
