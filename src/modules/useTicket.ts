import { makeRequest } from "./functions/makeRequest";
import { ref } from "vue";

export const useTickets = () => {
  const error = ref<string | null>(null);
  const loading = ref<boolean>(false);

  const getBookedSeats = async (
    flightId: string,
    flightDate: string
  ): Promise<string[]> => {
    try {
      // Make the API request with both flightId and flightDate
      const data = await makeRequest(
        `/tickets/booked/${flightId}/${flightDate}`
      );

      // Log the response for debugging purposes
      console.log("Booked seats data:", data);

      // Type assertion to ensure data is of the expected format
      if (Array.isArray(data.bookedSeats)) {
        return data.bookedSeats;
      } else {
        console.warn("Unexpected response format:", data);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch booked seats:", err);
      return [];
    }
  };
  return {
    error,
    loading,
    getBookedSeats,
  };
};
