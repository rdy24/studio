"use client";

import * as React from "react";
import type { Voyage, Destination } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
	fetchVoyages,
	fetchVoyageById,
	createVoyage,
	updateVoyage as updateVoyageApi,
	deleteVoyage as deleteVoyageApi,
	VoyageCreateInput,
	VoyageUpdateInput,
} from "@/lib/services/voyage-frontend-service";

interface VoyageContextType {
	voyages: Voyage[];
	addVoyage: (
		voyageData: Omit<VoyageCreateInput, "id">
	) => Promise<Voyage | null>;
	updateVoyage: (
		voyageId: string,
		voyageData: VoyageUpdateInput
	) => Promise<Voyage | null>;
	deleteVoyage: (voyageId: string) => Promise<boolean>;
	initialVoyagesLoaded: boolean;
	isLoading: boolean;
	error: string | null;
	getVoyageById: (id: string) => Voyage | undefined;
}

const VoyageContext = React.createContext<VoyageContextType | undefined>(
	undefined
);

export const VoyageProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [voyages, setVoyages] = React.useState<Voyage[]>([]);
	const [initialVoyagesLoaded, setInitialVoyagesLoaded] =
		React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const { toast } = useToast();

	// Fetch voyages from API
	const loadVoyages = React.useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fetchVoyages();
			setVoyages(data.data);
			setInitialVoyagesLoaded(true);
		} catch (err) {
			console.error("Error fetching voyages:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to load voyages",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	// Load voyages on component mount
	React.useEffect(() => {
		loadVoyages();
	}, [loadVoyages]);

	// Add a new voyage
	const addVoyage = async (
		voyageData: Omit<VoyageCreateInput, "id">
	): Promise<Voyage | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const newVoyage = await createVoyage(
				voyageData as VoyageCreateInput
			);
			setVoyages((prevVoyages) => [...prevVoyages, newVoyage]);
			return newVoyage;
		} catch (err) {
			console.error("Error adding voyage:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error ? err.message : "Failed to add voyage",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Update an existing voyage
	const updateVoyage = async (
		voyageId: string,
		voyageData: VoyageUpdateInput
	): Promise<Voyage | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const updatedVoyage = await updateVoyageApi(voyageId, voyageData);
			setVoyages((prevVoyages) =>
				prevVoyages.map((voy) =>
					voy.id === voyageId ? updatedVoyage : voy
				)
			);
			return updatedVoyage;
		} catch (err) {
			console.error("Error updating voyage:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to update voyage",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a voyage
	const deleteVoyage = async (voyageId: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);
		try {
			await deleteVoyageApi(voyageId);
			setVoyages((prevVoyages) =>
				prevVoyages.filter((voy) => voy.id !== voyageId)
			);
			return true;
		} catch (err) {
			console.error("Error deleting voyage:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to delete voyage",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	// Get a voyage by ID
	const getVoyageById = (id: string): Voyage | undefined => {
		return voyages.find((voyage) => voyage.id === id);
	};

	return (
		<VoyageContext.Provider
			value={{
				voyages,
				addVoyage,
				updateVoyage,
				deleteVoyage,
				initialVoyagesLoaded,
				isLoading,
				error,
				getVoyageById,
			}}
		>
			{children}
		</VoyageContext.Provider>
	);
};

export const useVoyageContext = () => {
	const context = React.useContext(VoyageContext);
	if (context === undefined) {
		throw new Error(
			"useVoyageContext must be used within a VoyageProvider"
		);
	}
	return context;
};
