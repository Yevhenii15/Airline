import type { Airport } from "../interfaces/interfaces";
import { ref, computed } from "vue";
import { useUsers } from "./auth/useUsers";
import { makeRequest } from "./functions/makeRequest";
const { getTokenAndUserId } = useUsers();

export const useAirports = () => {
  const airports = ref<Airport[]>([]);
  const airport = ref<Airport | null>(null);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const fetchAirports = async (): Promise<void> => {
    loading.value = true;
    try {
      const data = await makeRequest("/airports/all", "GET");

      airports.value = data;
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

      const data = await makeRequest(
        `/airports/fetch/${airportCode}`,
        "GET",
        undefined,
        true
      );

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

      const response = await makeRequest(
        `/airports/${_id}`,
        "DELETE",
        undefined,
        true
      );

      // Update frontend state after deletion
      airports.value = airports.value.filter((airport) => airport._id !== _id);
      console.log("✅ Airport deleted:", _id);
      alert("Airport deleted successfully");
    } catch (err) {
      console.error("❌ Error in deleteAirport:", err);
      alert("Failed to delete airport");
      error.value = (err as Error).message;
    }
  };
  /**
   * Computed map of airport codes (etea) to airport names
   */
  const airportNameMap = computed(() => {
    const map: Record<string, string> = {};
    for (const airport of airports.value) {
      map[airport.airportCode] = `${airport.name}, ${airport.cityName}`;
    }
    return map;
  });

  return {
    airports,
    airport,
    error,
    loading,
    fetchAirports,
    fetchAndStoreAirport,
    deleteAirport,
    airportNameMap,
  };
};
