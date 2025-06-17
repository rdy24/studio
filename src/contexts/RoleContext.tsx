
"use client";

import * as React from "react";
import type { Role } from "@/types";

interface RoleContextType {
  roles: Role[];
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => void;
  initialRolesLoaded: boolean;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

const initialRolesData: Role[] = [
  { id: "1", name: "Administrator", description: "Full access to all system features.", permissions: ["manage_users", "manage_roles", "manage_voyages", "view_reports"] },
  { id: "2", name: "Travel Agent", description: "Manages voyages and bookings.", permissions: ["manage_voyages", "view_bookings"] },
  { id: "3", name: "Support Staff", description: "Assists users and manages support tickets.", permissions: ["view_users", "manage_support_tickets"] },
];

const LOCAL_STORAGE_KEY = "voyageControlRoles";

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [initialRolesLoaded, setInitialRolesLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedRoles = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      } else {
        setRoles(initialRolesData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialRolesData));
      }
    } catch (error) {
      console.error("Failed to load roles from localStorage:", error);
      setRoles(initialRolesData); // Fallback to initial data
    }
    setInitialRolesLoaded(true);
  }, []);

  React.useEffect(() => {
    if (initialRolesLoaded) { // Only save if initial load is complete
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(roles));
      } catch (error) {
        console.error("Failed to save roles to localStorage:", error);
      }
    }
  }, [roles, initialRolesLoaded]);

  const addRole = (role: Role) => {
    setRoles((prevRoles) => [...prevRoles, role]);
  };

  const updateRole = (updatedRole: Role) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => (role.id === updatedRole.id ? updatedRole : role))
    );
  };

  const deleteRole = (roleId: string) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
  };

  return (
    <RoleContext.Provider value={{ roles, addRole, updateRole, deleteRole, initialRolesLoaded }}>
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
