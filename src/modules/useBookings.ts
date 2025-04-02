import { ref } from "vue";
import { makeRequest } from "./functions/makeRequest";
import type { Booking } from "./../interfaces/interfaces";

export const useBookings = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const createBooking = async (bookingData: Booking) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await makeRequest(
        "/bookings",
        "POST",
        bookingData,
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
