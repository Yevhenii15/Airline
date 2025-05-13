import { ref } from "vue";
import type { Flight, NewFlight } from "@/interfaces/interfaces";
import { useUsers } from "./auth/useUsers";
import { useBookings } from "../modules/useBookings";

import { makeRequest } from "./functions/makeRequest"; // Unified request handling

const { getTokenAndUserId } = useUsers();
const { cancelBooking, fetchAllBookings, bookings } = useBookings();

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
  const fetchFlightById = async (id: string): Promise<Flight | null> => {
    loading.value = true;
    console.log(`${import.meta.env.VITE_API_BASE_URL}/flights/${id}`);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/flights/${id}`
      );
      if (!res.ok) {
        // Handle not found or deleted flight
        if (res.status === 404) {
          return null; // Return null to indicate the flight was deleted
        }
        throw new Error("Failed to fetch flight");
      }
      return await res.json();
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error in fetchFlightById:", error.value);
      throw err; // Rethrow to handle it in the calling function
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

  const deleteFlight = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing flight ID! Cannot delete.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      // Ensure _id is a valid string before proceeding
      if (typeof _id !== "string" || !_id.trim()) {
        console.error("❌ ERROR: Invalid flight ID!");
        return;
      }

      // Step 1: Fetch all bookings and check if any booking contains the flight ID
      await fetchAllBookings(); // Fetch all bookings (you can adjust to fetch only relevant bookings)
      const bookingsForFlight = bookings.value.filter((booking) =>
        booking.tickets.some((ticket) => ticket.flight_id === _id)
      );

      if (bookingsForFlight.length > 0) {
        // Step 2: Prompt for confirmation to cancel bookings
        const confirmDelete = confirm(
          "This flight has existing bookings. Do you want to cancel all bookings and delete the flight?"
        );

        if (!confirmDelete) {
          console.log("❌ Deletion cancelled.");
          return;
        }

        // Step 3: Cancel all bookings
        for (const booking of bookingsForFlight) {
          for (const ticket of booking.tickets) {
            if (ticket.flight_id === _id) {
              await cancelBooking(booking._id as string); // Ensure that booking._id is treated as a string
            }
          }
        }
        alert("All bookings have been cancelled.");
      }

      // Step 4: Proceed to delete the flight
      await makeRequest(`/flights/${_id}`, "DELETE", undefined, true);
      flights.value = flights.value.filter((flight) => flight._id !== _id);
      alert("Flight deleted successfully");
      console.log("✅ Flight deleted:", _id);
    } catch (err) {
      alert("Failed to delete flight");
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
    fetchFlightById,
    addFlight,
    deleteFlight,
    updateFlight,
  };
};
