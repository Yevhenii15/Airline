import type { Airport } from "../interfaces/interfaces";
import { ref } from "vue";

export const useAirports = () => {
  const airports = ref<Airport[]>([]);
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

  return { airports, error, loading, fetchAirports };
};
