import type {
	User,
	CreateUserRequest,
	UpdateUserRequest,
	ApiResponse,
	PaginatedResponse,
} from "@/types";

const API_BASE_URL = "/api";

export interface GetUsersParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: "Active" | "Inactive" | "Pending";
	roleId?: string;
}

class UsersApi {
	// Get all users with pagination and filtering
	async getUsers(
		params: GetUsersParams = {}
	): Promise<PaginatedResponse<User>> {
		const searchParams = new URLSearchParams();

		if (params.page) searchParams.append("page", params.page.toString());
		if (params.limit) searchParams.append("limit", params.limit.toString());
		if (params.search) searchParams.append("search", params.search);
		if (params.status) searchParams.append("status", params.status);
		if (params.roleId) searchParams.append("roleId", params.roleId);

		const response = await fetch(
			`${API_BASE_URL}/users?${searchParams.toString()}`
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch users");
		}

		const data = await response.json();

		// Transform date strings back to Date objects
		data.data = data.data.map((user: any) => ({
			...user,
			lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
			dateJoined: user.dateJoined ? new Date(user.dateJoined) : undefined,
			createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
		}));

		return data;
	}

	// Get user by ID
	async getUserById(id: string): Promise<ApiResponse<User>> {
		const response = await fetch(`${API_BASE_URL}/users/${id}`);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch user");
		}

		const data = await response.json();

		// Transform date strings back to Date objects
		if (data.data) {
			data.data = {
				...data.data,
				lastLogin: data.data.lastLogin
					? new Date(data.data.lastLogin)
					: undefined,
				dateJoined: data.data.dateJoined
					? new Date(data.data.dateJoined)
					: undefined,
				createdAt: data.data.createdAt
					? new Date(data.data.createdAt)
					: undefined,
				updatedAt: data.data.updatedAt
					? new Date(data.data.updatedAt)
					: undefined,
			};
		}

		return data;
	}

	// Create new user
	async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
		const response = await fetch(`${API_BASE_URL}/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to create user");
		}

		const data = await response.json();

		// Transform date strings back to Date objects
		if (data.data) {
			data.data = {
				...data.data,
				lastLogin: data.data.lastLogin
					? new Date(data.data.lastLogin)
					: undefined,
				dateJoined: data.data.dateJoined
					? new Date(data.data.dateJoined)
					: undefined,
				createdAt: data.data.createdAt
					? new Date(data.data.createdAt)
					: undefined,
				updatedAt: data.data.updatedAt
					? new Date(data.data.updatedAt)
					: undefined,
			};
		}

		return data;
	}

	// Update user
	async updateUser(
		id: string,
		userData: UpdateUserRequest
	): Promise<ApiResponse<User>> {
		const response = await fetch(`${API_BASE_URL}/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to update user");
		}

		const data = await response.json();

		// Transform date strings back to Date objects
		if (data.data) {
			data.data = {
				...data.data,
				lastLogin: data.data.lastLogin
					? new Date(data.data.lastLogin)
					: undefined,
				dateJoined: data.data.dateJoined
					? new Date(data.data.dateJoined)
					: undefined,
				createdAt: data.data.createdAt
					? new Date(data.data.createdAt)
					: undefined,
				updatedAt: data.data.updatedAt
					? new Date(data.data.updatedAt)
					: undefined,
			};
		}

		return data;
	}

	// Delete user
	async deleteUser(id: string): Promise<ApiResponse<null>> {
		const response = await fetch(`${API_BASE_URL}/users/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to delete user");
		}

		return await response.json();
	}
}

// Export singleton instance
export const usersApi = new UsersApi();
