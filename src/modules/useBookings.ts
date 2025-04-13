import { ref } from "vue";
import { makeRequest } from "./functions/makeRequest";
import { useUsers } from "../modules/auth/useUsers"; // Correct import
import type { Booking } from "./../interfaces/interfaces";

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

  return {
    error,
    loading,
    createBooking,
  };
};
