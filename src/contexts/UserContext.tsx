"use client";

import * as React from "react";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types";
import { usersApi } from "@/lib/api/users";

interface UserContextType {
	users: User[];
	loading: boolean;
	error: string | null;
	addUser: (userData: CreateUserRequest) => Promise<void>;
	updateUser: (userId: string, userData: UpdateUserRequest) => Promise<void>;
	deleteUser: (userId: string) => Promise<void>;
	refreshUsers: () => Promise<void>;
	getUserNameById: (userId: string) => string | undefined;
	initialUsersLoaded: boolean;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [users, setUsers] = React.useState<User[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [initialUsersLoaded, setInitialUsersLoaded] = React.useState(false);

	// Load users from API
	const loadUsers = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await usersApi.getUsers({ limit: 1000 }); // Get all users
			setUsers(response.data);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load users";
			setError(errorMessage);
			console.error("Failed to load users:", err);
		} finally {
			setLoading(false);
			setInitialUsersLoaded(true);
		}
	}, []);

	// Initial load
	React.useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const addUser = async (userData: CreateUserRequest): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			const response = await usersApi.createUser(userData);
			setUsers((prevUsers) => [response.data, ...prevUsers]);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to create user";
			setError(errorMessage);
			throw err; // Re-throw to allow component to handle
		} finally {
			setLoading(false);
		}
	};

	const updateUser = async (
		userId: string,
		userData: UpdateUserRequest
	): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			const response = await usersApi.updateUser(userId, userData);
			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.id === userId ? response.data : user
				)
			);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to update user";
			setError(errorMessage);
			throw err; // Re-throw to allow component to handle
		} finally {
			setLoading(false);
		}
	};

	const deleteUser = async (userId: string): Promise<void> => {
		try {
			setLoading(true);
			setError(null);
			await usersApi.deleteUser(userId);
			setUsers((prevUsers) =>
				prevUsers.filter((user) => user.id !== userId)
			);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to delete user";
			setError(errorMessage);
			throw err; // Re-throw to allow component to handle
		} finally {
			setLoading(false);
		}
	};

	const refreshUsers = async (): Promise<void> => {
		await loadUsers();
	};

	const getUserNameById = (userId: string): string | undefined => {
		const user = users.find((u) => u.id === userId);
		return user?.name;
	};

	return (
		<UserContext.Provider
			value={{
				users,
				loading,
				error,
				addUser,
				updateUser,
				deleteUser,
				refreshUsers,
				getUserNameById,
				initialUsersLoaded,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => {
	const context = React.useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
};
