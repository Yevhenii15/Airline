import { ref, computed } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "../modules/auth/useUsers"; // Correct import
import type { Booking, Flight } from "./../interfaces/interfaces";

const { getTokenAndUserId } = useUsers(); // Correct function call

export const useBookings = () => {
  const bookings = ref<Booking[]>([]);
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const createBooking = async (bookingData: Booking) => {
    loading.value = true;
    error.value = null;
    try {
      const { userId, email } = getTokenAndUserId(); // Fetch user info using getTokenAndUserId
      if (!userId || !email) {
        throw new Error("User not logged in");
      }

      console.log("User email:", email); // Access user email directly from getTokenAndUserId()

      // Pass userId and userEmail with the booking data
      const response = await makeRequest(
        "/bookings",
        "POST",
        { ...bookingData, user_id: userId, user_email: email }, // Use userId and email from getTokenAndUserId
        true
      );
      console.log("Booking successful:", response);
      return response;
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const selectedFlightData = ref<Flight | null>(null);

  const validFlightDates = computed(() => {
    const flight = selectedFlightData.value;
    if (!flight || !flight.operatingPeriod || !flight.departureDay) return [];

    const { startDate, endDate } = flight.operatingPeriod;
    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);
    const validDates: Date[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time part to compare by date only

    while (fromDate <= toDate) {
      const isSameDay =
        fromDate.toLocaleDateString("en-US", { weekday: "long" }) ===
        flight.departureDay;

      const isFutureOrToday = fromDate >= today;

      if (isSameDay && isFutureOrToday) {
        validDates.push(new Date(fromDate));
      }

      fromDate.setDate(fromDate.getDate() + 1);
    }

    return validDates;
  });

  const disabledDates = computed(() => {
    const validDates = validFlightDates.value;

    return {
      predicate: (currentDate: Date) =>
        !validDates.some((validDate) => {
          return (
            currentDate.getFullYear() === validDate.getFullYear() &&
            currentDate.getMonth() === validDate.getMonth() &&
            currentDate.getDate() === validDate.getDate()
          );
        }),
    };
  });

  const formatLocalDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  // Admin: Fetch all bookings
  const fetchAllBookings = async (): Promise<void> => {
    loading.value = true;
    try {
      const { isAdmin } = getTokenAndUserId();
      if (!isAdmin) throw new Error("Access Denied: Admins only");

      const data: Booking[] = await makeRequest(
        "/bookings",
        "GET",
        undefined,
        true
      );
      bookings.value = data || [];
      console.log("📦 All bookings fetched", bookings.value);
    } catch (err) {
      error.value = (err as Error).message;
      bookings.value = [];
    } finally {
      loading.value = false;
    }
  };

  // User: Fetch own bookings
  const fetchUserBookings = async (): Promise<void> => {
    loading.value = true;
    try {
      const { userId } = getTokenAndUserId();
      const data: Booking[] = await makeRequest(
        `/bookings/user/${userId}`,
        "GET",
        undefined,
        true
      );
      bookings.value = data || [];
      console.log("👤 User bookings fetched", bookings.value);
    } catch (err) {
      error.value = (err as Error).message;
      bookings.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Shared: Fetch single booking
  const fetchBookingById = async (id: string): Promise<Booking> => {
    try {
      const booking = await makeRequest(
        `/bookings/${id}`,
        "GET",
        undefined,
        true
      );
      return booking;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  // Admin/User: Cancel booking
  const cancelBooking = async (id: string): Promise<void> => {
    try {
      await makeRequest(`/bookings/${id}/cancel`, "PATCH", undefined, true);

      // Instead of removing, just update the status locally
      const booking = bookings.value.find((b) => b._id === id);
      if (booking) {
        booking.bookingStatus = "Cancelled";
      }

      console.log("❌ Booking marked as cancelled:", id);
    } catch (err) {
      error.value = (err as Error).message;
    }
  };

  return {
    bookings,
    error,
    loading,
    createBooking,
    selectedFlightData,
    disabledDates,
    formatLocalDate,
    fetchAllBookings,
    fetchUserBookings,
    fetchBookingById,
    cancelBooking,
  };
};
