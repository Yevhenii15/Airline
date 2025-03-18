import { ref } from "vue";
import type { Airport } from "../interfaces/interfaces";

export const useAirports = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const airports = ref<Airport[]>([]);

  const fetchAirports = async (): Promise<void> => {
    loading.value = true;

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/airports`);
      if (!response.ok) {
        throw new Error("No airport data available");
      }

      const data: Airport[] = await response.json();
      airports.value = data;
      console.log("Airports fetched:", airports.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  return {
    error,
    loading,
    airports,
    fetchAirports,
  };
};
