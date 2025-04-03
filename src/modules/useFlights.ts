import { ref } from "vue";
import type { Flight, NewFlight } from "@/interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
import { makeRequest } from "./functions/makeRequest"; // Unified request handling

const { getTokenAndUserId } = useUsers();

export const useFlights = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const flights = ref<Flight[]>([]);

  const fetchFlights = async (): Promise<void> => {
    loading.value = true;
    try {
      const data: Flight[] = await makeRequest("/flights", "GET");
      flights.value = data || []; // Ensure it's always an array
      console.log("✅ Flights fetched", flights.value);
    } catch (err) {
      error.value = (err as Error).message;
      flights.value = []; // Reset on error to avoid breaking Vue reactivity
    } finally {
      loading.value = false;
    }
  };

  // Add a new flight
  const addFlight = async (flight: NewFlight): Promise<void> => {
    try {
      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const newFlight: Flight = await makeRequest(
        "/flights",
        "POST",
        flight,
        true
      );
      flights.value.push(newFlight);
      console.log("🛫 New flight added", newFlight);

      await fetchFlights(); // Refresh flights list
    } catch (err) {
      console.error("❌ Error in addFlight:", (err as Error).message);
      error.value = (err as Error).message;
    }
  };

  // Delete a flight
  const deleteFlight = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing flight ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      await makeRequest(`/flights/${_id}`, "DELETE", undefined, true);

      flights.value = flights.value.filter((flight) => flight._id !== _id);
      console.log("✅ Flight deleted:", _id);
    } catch (err) {
      console.error("❌ Error in deleteFlight:", err);
      error.value = (err as Error).message;
    }
  };

  // Update a flight
  const updateFlight = async (
    id: string,
    updatedFlight: Partial<NewFlight>
  ) => {
    try {
      const { token, isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const updatedData: Flight = await makeRequest(
        `/flights/${id}`,
        "PUT",
        updatedFlight,
        true
      );

      // Update flights reactively
      flights.value = flights.value.map((flight) =>
        flight._id === id ? { ...flight, ...updatedData } : flight
      );

      console.log("✈️ Flight updated", updatedData);
    } catch (err) {
      console.error("❌ Error in updateFlight:", err);
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
