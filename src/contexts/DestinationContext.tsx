"use client";

import * as React from "react";
import type { Destination } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
	fetchDestinations,
	createDestination,
	updateDestination as updateDestinationApi,
	deleteDestination as deleteDestinationApi,
	DestinationCreateInput,
	DestinationUpdateInput,
} from "@/lib/services/destination-service";

interface DestinationContextType {
	destinations: Destination[];
	addDestination: (
		destination: Omit<Destination, "id">
	) => Promise<Destination | null>;
	updateDestination: (
		destinationId: string,
		destinationData: Omit<Destination, "id">
	) => Promise<Destination | null>;
	deleteDestination: (destinationId: string) => Promise<boolean>;
	initialDestinationsLoaded: boolean;
	isLoading: boolean;
	error: string | null;
	getDestinationNameById: (id: string) => string;
}

const DestinationContext = React.createContext<
	DestinationContextType | undefined
>(undefined);

export const DestinationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [destinations, setDestinations] = React.useState<Destination[]>([]);
	const [initialDestinationsLoaded, setInitialDestinationsLoaded] =
		React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const { toast } = useToast();

	// Fetch destinations from API
	const loadDestinations = React.useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await fetchDestinations();
			setDestinations(data.data);
			setInitialDestinationsLoaded(true);
		} catch (err) {
			console.error("Error fetching destinations:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to load destinations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	// Load destinations on component mount
	React.useEffect(() => {
		loadDestinations();
	}, [loadDestinations]);

	// Add a new destination
	const addDestination = async (
		destinationData: Omit<Destination, "id">
	): Promise<Destination | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const destinationInput: DestinationCreateInput = {
				name: destinationData.name,
				country: destinationData.country,
				description: destinationData.description,
				imageUrl: destinationData.imageUrl,
			};

			const newDestination = await createDestination(destinationInput);
			setDestinations((prevDestinations) => [
				...prevDestinations,
				newDestination,
			]);
			return newDestination;
		} catch (err) {
			console.error("Error adding destination:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to add destination",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Update an existing destination
	const updateDestination = async (
		destinationId: string,
		destinationData: Omit<Destination, "id">
	): Promise<Destination | null> => {
		setIsLoading(true);
		setError(null);
		try {
			const destinationInput: DestinationUpdateInput = {
				name: destinationData.name,
				country: destinationData.country,
				description: destinationData.description,
				imageUrl: destinationData.imageUrl,
			};

			const updatedDestination = await updateDestinationApi(
				destinationId,
				destinationInput
			);

			setDestinations((prevDestinations) =>
				prevDestinations.map((dest) =>
					dest.id === destinationId ? updatedDestination : dest
				)
			);
			return updatedDestination;
		} catch (err) {
			console.error("Error updating destination:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to update destination",
				variant: "destructive",
			});
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Delete a destination
	const deleteDestination = async (
		destinationId: string
	): Promise<boolean> => {
		setIsLoading(true);
		setError(null);
		try {
			await deleteDestinationApi(destinationId);

			setDestinations((prevDestinations) =>
				prevDestinations.filter((dest) => dest.id !== destinationId)
			);
			return true;
		} catch (err) {
			console.error("Error deleting destination:", err);
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			toast({
				title: "Error",
				description:
					err instanceof Error
						? err.message
						: "Failed to delete destination",
				variant: "destructive",
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const getDestinationNameById = (id: string): string => {
		const destination = destinations.find((d) => d.id === id);
		return destination ? destination.name : "Unknown";
	};

	return (
		<DestinationContext.Provider
			value={{
				destinations,
				addDestination,
				updateDestination,
				deleteDestination,
				initialDestinationsLoaded,
				isLoading,
				error,
				getDestinationNameById,
			}}
		>
			{children}
		</DestinationContext.Provider>
	);
};

export const useDestinationContext = () => {
	const context = React.useContext(DestinationContext);
	if (context === undefined) {
		throw new Error(
			"useDestinationContext must be used within a DestinationProvider"
		);
	}
	return context;
};
