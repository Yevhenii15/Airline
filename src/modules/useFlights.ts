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

  const cancelFlight = async (_id: string): Promise<void> => {
    try {
      if (!_id) {
        console.error("❌ ERROR: Missing flight ID! Cannot cancel.");
        return;
      }

      const { token, isAdmin } = getTokenAndUserId();

      if (!isAdmin) throw new Error("Access Denied: Admins only");

      if (typeof _id !== "string" || !_id.trim()) {
        console.error("❌ ERROR: Invalid flight ID!");
        return;
      }

      // Step 1: Fetch all bookings and find those with this flight
      await fetchAllBookings();
      const bookingsForFlight = bookings.value.filter((booking) =>
        booking.tickets.some((ticket) => ticket.flight_id === _id)
      );

      if (bookingsForFlight.length > 0) {
        const confirmCancel = confirm(
          "This flight has existing bookings. Do you want to cancel the flight and all associated bookings?"
        );

        if (!confirmCancel) {
          console.log("❌ Flight cancellation aborted by user.");
          return;
        }

        for (const booking of bookingsForFlight) {
          let hasChanges = false;

          for (const ticket of booking.tickets) {
            if (
              ticket.flight_id === _id &&
              ticket.flightStatus !== "Cancelled"
            ) {
              ticket.flightStatus = "Cancelled";
              hasChanges = true;
            }
          }

          if (hasChanges) {
            booking.tickets = booking.tickets.map((ticket) =>
              ticket.flight_id === _id
                ? { ...ticket, flightStatus: "Cancelled" }
                : ticket
            );

            // Save ticket changes
            await makeRequest(
              `/bookings/${booking._id}`,
              "PATCH",
              { tickets: booking.tickets },
              true
            );

            // Mark the whole booking as cancelled
            await makeRequest(
              `/bookings/${booking._id}/cancel`,
              "PATCH",
              undefined,
              true
            );
          }
        }

        alert("All related bookings have been canceled.");
      }

      // Step 3: Mark the flight as canceled (soft delete)
      await makeRequest(`/flights/${_id}`, "DELETE", undefined, true); // Still using DELETE method as per route

      // Step 4: Update flight list in frontend
      const flightToCancel = flights.value.find((f) => f._id === _id);
      if (flightToCancel) {
        flightToCancel.status = "Cancelled";
      }

      alert("Flight has been successfully canceled.");
      console.log("✅ Flight canceled:", _id);
    } catch (err) {
      alert("Failed to cancel flight");
      console.error("❌ Error in cancelFlight:", err);
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
    cancelFlight,
    updateFlight,
  };
};
