import { ref } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "./auth/useUsers";
import { useBookings } from "../modules/useBookings";
import type { Flight, NewFlight } from "@/interfaces/interfaces";

const { getTokenAndUserId } = useUsers();
const { fetchAllBookings, bookings } = useBookings();

export const useFlights = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);
  const flights = ref<Flight[]>([]);

  const fetchFlights = async (): Promise<void> => {
    loading.value = true;
    try {
      const data: Flight[] = await makeRequest("/flights", "GET");
      flights.value = data || [];
      // console.log("✅ Flights fetched", flights.value);
    } catch (err) {
      error.value = (err as Error).message;
      flights.value = [];
    } finally {
      loading.value = false;
    }
  };
  const fetchFlightById = async (id: string): Promise<Flight | null> => {
    loading.value = true;
    // console.log(`${import.meta.env.VITE_API_BASE_URL}/flights/${id}`);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/flights/${id}`
      );
      if (!res.ok) {
        // Handle not found or deleted flight
        if (res.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch flight");
      }
      return await res.json();
    } catch (err) {
      error.value = (err as Error).message;
      // console.error("Error in fetchFlightById:", error.value);
      throw err;
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
      // console.log("🛫 New flight added", newFlight);

      await fetchFlights();
    } catch (err) {
      console.error("❌ Error in addFlight:", (err as Error).message);
      error.value = (err as Error).message;
    }
  };
  const validateFlightId = (id: string): boolean => {
    if (!id || typeof id !== "string" || !id.trim()) {
      console.error("❌ ERROR: Invalid or missing flight ID!");
      return false;
    }
    return true;
  };

  const getBookingsForFlight = (flightId: string) => {
    return bookings.value.filter((booking) =>
      booking.tickets.some((ticket) => ticket.flight_id === flightId)
    );
  };

  const cancelAssociatedBookings = async (
    bookingsForFlight: typeof bookings.value,
    flightId: string
  ): Promise<void> => {
    for (const booking of bookingsForFlight) {
      let hasChanges = false;

      booking.tickets = booking.tickets.map((ticket) => {
        if (
          ticket.flight_id === flightId &&
          ticket.flightStatus !== "Cancelled"
        ) {
          hasChanges = true;
          return { ...ticket, flightStatus: "Cancelled" };
        }
        return ticket;
      });

      if (hasChanges) {
        await makeRequest(
          `/bookings/${booking._id}`,
          "PATCH",
          { tickets: booking.tickets },
          true
        );

        await makeRequest(
          `/bookings/${booking._id}/cancel`,
          "PATCH",
          undefined,
          true
        );
      }
    }
  };

  const cancelFlightBackend = async (flightId: string): Promise<void> => {
    await makeRequest(`/flights/${flightId}`, "DELETE", undefined, true);
  };

  const updateFlightStatusInFrontend = (flightId: string): void => {
    const flight = flights.value.find((f) => f._id === flightId);
    if (flight) {
      flight.status = "Cancelled";
    }
  };

  const cancelFlight = async (_id: string): Promise<void> => {
    try {
      if (!validateFlightId(_id)) return;

      const { isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      await fetchAllBookings();
      const bookingsForFlight = getBookingsForFlight(_id);

      if (bookingsForFlight.length > 0) {
        const confirmCancel = confirm(
          "This flight has existing bookings. Do you want to cancel the flight and all associated bookings?"
        );
        if (!confirmCancel) return;

        await cancelAssociatedBookings(bookingsForFlight, _id);
        alert("All related bookings have been canceled.");
      }

      await cancelFlightBackend(_id);
      updateFlightStatusInFrontend(_id);
      alert("Flight has been successfully canceled.");
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

      // console.log("✈️ Flight updated", updatedData);
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
