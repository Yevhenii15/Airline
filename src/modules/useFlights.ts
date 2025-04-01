import { ref } from "vue";
import type { Flight, NewFlight } from "@/interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
import { makeRequest } from "./functions/makeRequest"; // Added makeRequest import
const { getTokenAndUserId } = useUsers();

export const useFlights = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const flights = ref<Flight[]>([]);

  const fetchFlights = async (): Promise<void> => {
    loading.value = true;
    try {
      const data: Flight[] = await makeRequest("/flights", "GET"); // Replaced fetch with makeRequest
      flights.value = data;
      console.log("Flights fetched", flights.value);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  };

  const addFlight = async (flight: NewFlight): Promise<void> => {
    try {
      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const newFlight: Flight = await makeRequest(
        "/flights",
        "POST",
        flight,
        true
      ); // Replaced fetch with makeRequest
      flights.value.push(newFlight);
      console.log("New flight added", newFlight);

      await fetchFlights();
    } catch (err) {
      console.error("Error in addFlight:", (err as Error).message);
    }
  };

  const deleteFlight = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing flight ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      await makeRequest(`/flights/${_id}`, "DELETE", undefined, true); // Replaced fetch with makeRequest

      // Update frontend state after deletion
      flights.value = flights.value.filter((flight) => flight._id !== _id);
      console.log("✅ Flight deleted:", _id);
    } catch (err) {
      console.error("❌ Error in deleteFlight:", err);
      error.value = (err as Error).message;
    }
  };

  const updateFlight = async (
    id: string,
    updatedFlight: Partial<Flight>
  ): Promise<void> => {
    try {
      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const updatedData: Flight = await makeRequest(
        `/flights/${id}`,
        "PUT",
        updatedFlight,
        true
      ); // Replaced fetch with makeRequest

      // Find index of the updated flight and replace it while preserving `_id`
      const index = flights.value.findIndex((flight) => flight._id === id);
      if (index !== -1) {
        flights.value[index] = { ...updatedData, _id: id };
      }
      console.log("Flight updated", flights.value[index]);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  return {
    error,
    loading,
    flights,
    fetchFlights,
    addFlight,
    deleteFlight,
    updateFlight,
  };
};
