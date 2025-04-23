import { makeRequest } from "./functions/makeRequest";
import { ref, computed } from "vue";

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
  const bookedSeats = ref<string[]>([]);
  const selectedSeats = ref<string[]>([]);
  const numberOfPassengers = ref<number>(1);
  const tickets = ref([
    {
      firstName: "",
      lastName: "",
      gender: "Male",
      seatNumber: "",
      ticketPrice: 0,
    },
  ]);
  const availableSeats = computed(() => {
    // Generate full seat map with status
    const rows = Array.from({ length: 32 }, (_, i) => (i + 1).toString());
    const seatLetters = ["A", "B", "C", "D", "E", "F"];

    const seats = [];

    for (const row of rows) {
      for (const seat of seatLetters) {
        const seatId = `${row}${seat}`;
        seats.push({
          seatNumber: seatId,
          status: bookedSeats.value.includes(seatId) ? "booked" : "available",
          _id: seatId,
        });
      }
    }

    return seats;
  });

  const handleSeatSelect = (selectedSeat: string) => {
    // Check if the number of selected seats exceeds the number of passengers
    if (selectedSeats.value.length >= numberOfPassengers.value) {
      alert(
        `You can select only ${numberOfPassengers.value} seats for ${numberOfPassengers.value} passengers.`
      );
      return; // Prevent further selection
    }

    // Handle seat selection logic for all passengers
    console.log("Selected seat:", selectedSeat);

    // Add seat if not already selected
    if (!selectedSeats.value.includes(selectedSeat)) {
      selectedSeats.value.push(selectedSeat);
    }

    // Update seat numbers for all tickets
    tickets.value.forEach((ticket, index) => {
      if (selectedSeats.value[index]) {
        ticket.seatNumber = selectedSeats.value[index];
      }
    });
  };

  return {
    error,
    loading,
    getBookedSeats,
    bookedSeats,
    selectedSeats,
    numberOfPassengers,
    tickets,
    availableSeats,
    handleSeatSelect,
  };
};
