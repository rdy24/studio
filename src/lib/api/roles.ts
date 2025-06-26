import { ApiResponse, Role } from "@/types";

export const rolesApi = {
	async getRoles(): Promise<ApiResponse<Role[]>> {
		const res = await fetch("/api/roles");
		if (!res.ok) throw new Error("Failed to fetch roles");
		return res.json();
	},
};
