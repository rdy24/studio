"use client";

import * as React from "react";
import type { User } from "@/types";

interface UserContextType {
	users: User[];
	addUser: (user: User) => void;
	updateUser: (user: User) => void;
	deleteUser: (userId: string) => void;
	getUserNameById: (userId: string) => string | undefined;
	initialUsersLoaded: boolean;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

const initialUsersData: User[] = [
	{
		id: "1",
		name: "Alice Wonderland",
		email: "alice@example.com",
		role: "Administrator",
		status: "Active",
		avatar: "https://placehold.co/40x40.png?text=AW",
		lastLogin: new Date("2024-07-20T10:00:00Z"),
		dateJoined: new Date("2023-01-15T09:00:00Z"),
	},
	{
		id: "2",
		name: "Bob The Builder",
		email: "bob@example.com",
		role: "Travel Agent",
		status: "Active",
		avatar: "https://placehold.co/40x40.png?text=BB",
		lastLogin: new Date("2024-07-21T14:30:00Z"),
		dateJoined: new Date("2023-02-20T11:00:00Z"),
	},
	{
		id: "3",
		name: "Charlie Chaplin",
		email: "charlie@example.com",
		role: "Support Staff",
		status: "Inactive",
		avatar: "https://placehold.co/40x40.png?text=CC",
		dateJoined: new Date("2023-03-10T16:00:00Z"),
	},
	{
		id: "4",
		name: "Diana Prince",
		email: "diana@example.com",
		role: "Travel Agent",
		status: "Pending",
		avatar: "https://placehold.co/40x40.png?text=DP",
		dateJoined: new Date("2024-07-22T08:00:00Z"),
	},
];

const LOCAL_STORAGE_KEY = "voyageControlUsers";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [users, setUsers] = React.useState<User[]>([]);
	const [initialUsersLoaded, setInitialUsersLoaded] = React.useState(false);

	React.useEffect(() => {
		try {
			const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (storedUsers) {
				const parsedUsers: User[] = JSON.parse(storedUsers).map(
					(user: any) => ({
						...user,
						dateJoined: user.dateJoined
							? new Date(user.dateJoined)
							: undefined,
						lastLogin: user.lastLogin
							? new Date(user.lastLogin)
							: undefined,
					})
				);
				setUsers(parsedUsers);
			} else {
				setUsers(initialUsersData);
				localStorage.setItem(
					LOCAL_STORAGE_KEY,
					JSON.stringify(initialUsersData)
				);
			}
		} catch (error) {
			console.error("Failed to load users from localStorage:", error);
			setUsers(initialUsersData); // Fallback to initial data
		}
		setInitialUsersLoaded(true);
	}, []);

	React.useEffect(() => {
		if (initialUsersLoaded) {
			// Only save if initial load is complete
			try {
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
			} catch (error) {
				console.error("Failed to save users to localStorage:", error);
			}
		}
	}, [users, initialUsersLoaded]);

	const addUser = (user: User) => {
		setUsers((prevUsers) => [...prevUsers, user]);
	};

	const updateUser = (updatedUser: User) => {
		setUsers((prevUsers) =>
			prevUsers.map((user) =>
				user.id === updatedUser.id ? updatedUser : user
			)
		);
	};

	const deleteUser = (userId: string) => {
		setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
	};

	const getUserNameById = (userId: string): string | undefined => {
		const user = users.find((u) => u.id === userId);
		return user?.name;
	};

	return (
		<UserContext.Provider
			value={{
				users,
				addUser,
				updateUser,
				deleteUser,
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
