import type { Airport } from "../interfaces/interfaces";
import { ref } from "vue";
import { useUsers } from "./auth/useUsers";
const { getTokenAndUserId } = useUsers();

export const useAirports = () => {
  const airports = ref<Airport[]>([]);
  const airport = ref<Airport | null>(null);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const fetchAirports = async (): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/airports/all`);

      if (!response.ok) {
        throw new Error("Failed to fetch airports");
      }

      airports.value = await response.json();
      console.log("Fetched airports:", airports.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };
  /**
   * Fetch a single airport from RapidAPI and store it in MongoDB
   */
  const fetchAndStoreAirport = async (airportCode: string): Promise<void> => {
    if (!airportCode) {
      error.value = "Airport code is required!";
      return;
    }

    loading.value = true;
    error.value = null;
    airport.value = null;

    try {
      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${apiBaseUrl}/airports/fetch/${airportCode}`,
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch airport details");
      }

      const data = await response.json();
      airport.value = data.airport;
      console.log("Fetched airport:", airport.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const deleteAirport = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing airport ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/airports/${_id}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to delete airport");
      }

      // Update frontend state after deletion
      airports.value = airports.value.filter((airport) => airport._id !== _id);
      console.log("✅ Airport deleted:", _id);
    } catch (err) {
      console.error("❌ Error in deleteAirport:", err);
      error.value = (err as Error).message;
    }
  };

  return {
    airports,
    airport,
    error,
    loading,
    fetchAirports,
    fetchAndStoreAirport,
    deleteAirport,
  };
};
