"use client";

import * as React from "react";
import type { Role } from "@/types";
import { getRoles } from "@/lib/api/roles";

interface RoleContextType {
	roles: Role[];
	addRole: (role: Role) => void;
	updateRole: (role: Role) => void;
	deleteRole: (roleId: string) => void;
	initialRolesLoaded: boolean;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [roles, setRoles] = React.useState<Role[]>([]);
	const [initialRolesLoaded, setInitialRolesLoaded] = React.useState(false);

	React.useEffect(() => {
		(async () => {
			try {
				const res = await getRoles();
				setRoles(res.data);
			} catch (error) {
				console.error("Failed to fetch roles from API:", error);
				setRoles([]);
			}
			setInitialRolesLoaded(true);
		})();
	}, []);

	const addRole = (role: Role) => {
		setRoles((prevRoles) => [...prevRoles, role]);
	};

	const updateRole = (updatedRole: Role) => {
		setRoles((prevRoles) =>
			prevRoles.map((role) =>
				role.id === updatedRole.id ? updatedRole : role
			)
		);
	};

	const deleteRole = (roleId: string) => {
		setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
	};

	return (
		<RoleContext.Provider
			value={{
				roles,
				addRole,
				updateRole,
				deleteRole,
				initialRolesLoaded,
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
