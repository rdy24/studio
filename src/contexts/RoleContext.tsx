"use client";

import * as React from "react";
import type { Role } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
	fetchRoles,
	createRole,
	updateRole as updateRoleApi,
	deleteRole as deleteRoleApi,
	RoleCreateInput,
	RoleUpdateInput,
} from "@/lib/services/role-service";

interface RoleContextType {
	roles: Role[];
	addRole: (
		role: Omit<Role, "id"> & {
			permissionIds: string[];
		}
	) => Promise<Role | null>;
	updateRole: (
		roleId: string,
		roleData: Omit<Role, "id" | "permissions"> & {
			permissionIds: string[];
		}
	) => Promise<Role | null>;
	deleteRole: (roleId: string) => Promise<boolean>;
	initialRolesLoaded: boolean;
	isLoading: boolean;
	error: string | null;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [roles, setRoles] = React.useState<Role[]>([]);
	const [initialRolesLoaded, setInitialRolesLoaded] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const { toast } = useToast();

	// Fetch roles from API
	const loadRoles = React.useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fetchRoles();
			setRoles(data.data);
			setInitialRolesLoaded(true);
		} catch (err) {
			console.error("Error fetching roles:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to load roles",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	// Load roles on component mount
	React.useEffect(() => {
		loadRoles();
	}, [loadRoles]);

	// Add a new role
	const addRole = async (
		roleData: Omit<Role, "id"> & {
			permissionIds: string[];
		}
	): Promise<Role | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const roleInput: RoleCreateInput = {
				name: roleData.name,
				description: roleData.description,
				permissionIds: roleData.permissionIds,
			};

			const newRole = await createRole(roleInput);
			setRoles((prevRoles) => [...prevRoles, newRole]);
			return newRole;
		} catch (err) {
			console.error("Error adding role:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to add role",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Update an existing role
	const updateRole = async (
		roleId: string,
		roleData: Omit<Role, "id" | "permissions"> & {
			permissionIds: string[];
		}
	): Promise<Role | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const roleInput: RoleUpdateInput = {
				name: roleData.name,
				description: roleData.description,
				permissionIds: roleData.permissionIds,
			};

			const updatedRole = await updateRoleApi(roleId, roleInput);

			setRoles((prevRoles) =>
				prevRoles.map((role) =>
					role.id === roleId ? updatedRole : role
				)
			);
			return updatedRole;
		} catch (err) {
			console.error("Error updating role:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to update role",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a role
	const deleteRole = async (roleId: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);
		try {
			await deleteRoleApi(roleId);

			setRoles((prevRoles) =>
				prevRoles.filter((role) => role.id !== roleId)
			);
			return true;
		} catch (err) {
			console.error("Error deleting role:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to delete role",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<RoleContext.Provider
			value={{
				roles,
				addRole,
				updateRole,
				deleteRole,
				initialRolesLoaded,
				isLoading,
				error,
			}}
		>
			{children}
		</RoleContext.Provider>
	);
};

export const useRoleContext = () => {
	const context = React.useContext(RoleContext);
	if (context === undefined) {
		throw new Error("useRoleContext must be used within a RoleProvider");
	}
	return context;
};
