import { ref, computed } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "../modules/auth/useUsers"; // Correct import
import type { Booking, Flight } from "./../interfaces/interfaces";

const { getTokenAndUserId } = useUsers(); // Correct function call

export const useBookings = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const createBooking = async (bookingData: Booking) => {
    loading.value = true;
    error.value = null;
    try {
      // Fetch user ID from localStorage via the getTokenAndUserId method
      const { userId } = getTokenAndUserId();
      console.log("User ID from getTokenAndUserId:", userId); // Debugging to check userId

      // Pass userId with the booking data
      const response = await makeRequest(
        "/bookings",
        "POST",
        { ...bookingData, user_id: userId }, // Add userId to bookingData
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

  return {
    error,
    loading,
    createBooking,
    selectedFlightData,
    disabledDates,
    formatLocalDate,
  };
};
