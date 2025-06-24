"use client";

import * as React from "react";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
	fetchUsers,
	createUser,
	updateUser as updateUserApi,
	deleteUser as deleteUserApi,
	UserCreateInput,
	UserUpdateInput,
} from "@/lib/services/user-service";

interface UserContextType {
	users: User[];
	addUser: (
		user: Omit<User, "id" | "dateJoined" | "lastLogin"> & {
			roleId: number;
			password?: string;
		}
	) => Promise<User | null>;
	updateUser: (
		userId: string,
		userData: Omit<User, "id" | "dateJoined" | "lastLogin" | "role"> & {
			roleId: number;
			password?: string;
		}
	) => Promise<User | null>;
	deleteUser: (userId: string) => Promise<boolean>;
	initialUsersLoaded: boolean;
	isLoading: boolean;
	error: string | null;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [users, setUsers] = React.useState<User[]>([]);
	const [initialUsersLoaded, setInitialUsersLoaded] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const { toast } = useToast();

	// Fetch users from API
	const loadUsers = React.useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fetchUsers();
			setUsers(data.data);
			setInitialUsersLoaded(true);
		} catch (err) {
			console.error("Error fetching users:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to load users",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	// Load users on component mount
	React.useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	// Add a new user
	const addUser = async (
		userData: Omit<User, "id" | "dateJoined" | "lastLogin"> & {
			roleId: number;
			password?: string;
		}
	): Promise<User | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const userInput: UserCreateInput = {
				name: userData.name,
				email: userData.email,
				password: userData.password,
				roleId: userData.roleId,
				status: userData.status,
				avatar: userData.avatar,
			};

			const newUser = await createUser(userInput);
			setUsers((prevUsers) => [...prevUsers, newUser]);
			return newUser;
		} catch (err) {
			console.error("Error adding user:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to add user",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Update an existing user
	const updateUser = async (
		userId: string,
		userData: Omit<User, "id" | "dateJoined" | "lastLogin" | "role"> & {
			roleId: number;
			password?: string;
		}
	): Promise<User | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const userInput: UserUpdateInput = {
				name: userData.name,
				email: userData.email,
				password: userData.password,
				roleId: userData.roleId,
				status: userData.status,
				avatar: userData.avatar,
			};

			const updatedUser = await updateUserApi(userId, userInput);

			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user.id === userId ? updatedUser : user
				)
			);
			return updatedUser;
		} catch (err) {
			console.error("Error updating user:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to update user",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a user
	const deleteUser = async (userId: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);
		try {
			await deleteUserApi(userId);

			setUsers((prevUsers) =>
				prevUsers.filter((user) => user.id !== userId)
			);
			return true;
		} catch (err) {
			console.error("Error deleting user:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to delete user",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<UserContext.Provider
			value={{
				users,
				addUser,
				updateUser,
				deleteUser,
				initialUsersLoaded,
				isLoading,
				error,
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
