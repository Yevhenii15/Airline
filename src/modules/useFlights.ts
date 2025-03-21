import { ref } from "vue";
import type { Flight, NewFlight } from "@/interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
const { getTokenAndUserId } = useUsers();

export const useFlights = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const flights = ref<Flight[]>([]);

  const fetchFlights = async (): Promise<void> => {
    loading.value = true;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      console.log("ApiBaseUrl:", apiBaseUrl);
      const response = await fetch(`${apiBaseUrl}/flights`);
      if (!response.ok) {
        throw new Error("No data available");
      }

      const data: Flight[] = await response.json();
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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(flight),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server response error:", errorResponse);
        throw new Error(errorResponse.error || "No data available");
      }

      const newFlight: Flight = await response.json();
      flights.value.push(newFlight);
      console.log(" New flight added", newFlight);

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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/flights/${_id}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to delete flight");
      }

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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/flights/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": token },
        body: JSON.stringify(updatedFlight),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read response as text
        throw new Error(errorText); // Throw the actual server error message
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const updatedData: Flight = await response.json();
        const index = flights.value.findIndex((flight) => flight._id === id);
        if (index !== -1) {
          flights.value[index] = { ...updatedData, _id: id };
        }
        console.log("Flight updated", flights.value[index]);
      } else {
        console.log("Flight updated successfully (no JSON response)");
      }
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
