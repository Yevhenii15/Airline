<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-3xl font-bold text-blue-600 mb-6">Book a Flight</h2>

    <!-- Departure Airport Selection -->
    <label class="block text-blue-600 font-medium">Departure Airport:</label>
    <select
      v-model="departureAirport"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="airport in uniqueDepartureAirports"
        :key="airport"
        :value="airport"
        class="text-black"
      >
        {{ airport }}
      </option>
    </select>

    <!-- Arrival Airport Selection -->
    <label v-if="departureAirport" class="block text-blue-600 font-medium mt-6">
      Arrival Airport:
    </label>
    <select
      v-if="departureAirport"
      v-model="arrivalAirport"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="airport in availableArrivalAirports"
        :key="airport"
        :value="airport"
        class="text-black"
      >
        {{ airport }}
      </option>
    </select>

    <!-- Flight Selection -->
    <label v-if="arrivalAirport" class="block text-blue-600 font-medium mt-6">
      Select Flight:
    </label>
    <select
      v-if="arrivalAirport"
      v-model="selectedFlight"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="flight in availableFlights"
        :key="flight._id"
        :value="flight._id"
        class="text-black"
      >
        {{ flight.flightNumber }} ({{ flight.route.departureAirport_id }})
        {{ flight.departureTime }} -> ({{ flight.route.arrivalAirport_id }})
        {{ flight.arrivalTime }} ${{ flight.basePrice }}
      </option>
    </select>

    <!-- Date Picker -->
    <label v-if="selectedFlight" class="block text-blue-600 font-medium mt-6">
      Select Departure Date:
    </label>
    <vue3-datepicker
      v-if="selectedFlight"
      v-model="selectedDate"
      :disabledDates="disabledDates"
      placeholder="Select Date"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
      format="yyyy-MM-dd"
    />

    <!-- Number of Passengers -->
    <label v-if="selectedFlight" class="block text-blue-600 font-medium"
      >Number of Passengers:</label
    >
    <input
      v-if="selectedFlight"
      v-model.number="numberOfPassengers"
      type="number"
      min="1"
      max="10"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
      required
    />

    <!-- Display single SeatMap for all passengers -->
    <SeatMap
      v-if="selectedFlight"
      :seat-map="availableSeats"
      :selected-seats="selectedSeats"
      @select-seat="handleSeatSelect"
    />

    <div
      v-for="(ticket, index) in tickets"
      v-if="selectedFlight"
      :key="index"
      class="bg-gray-100 p-6 rounded-lg mt-4"
    >
      <input
        v-model="ticket.firstName"
        placeholder="First Name"
        class="w-full p-3 border border-blue-500 rounded-lg text-black"
        required
      />
      <input
        v-model="ticket.lastName"
        placeholder="Last Name"
        class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
        required
      />
      <select
        v-model="ticket.gender"
        class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
      >
        <option value="Male" class="text-black">Male</option>
        <option value="Female" class="text-black">Female</option>
      </select>
      <!-- Seat selection is handled globally, no need for individual seat pickers -->
      <input
        v-model="ticket.seatNumber"
        placeholder="Seat Number"
        class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
        disabled
      />
      <input
        v-model.number="ticket.ticketPrice"
        type="number"
        class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
        disabled
      />
    </div>

    <h3 class="text-xl font-bold text-blue-600 mt-6">
      Total Price: ${{ totalPrice }}
    </h3>
    <button
      @click="submitBooking"
      :disabled="loading"
      class="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg"
    >
      {{ loading ? "Processing..." : "Confirm Booking" }}
    </button>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useUsers } from "../modules/auth/useUsers";
import { useTickets } from "../modules/useTicket";
import Vue3Datepicker from "vue3-datepicker";
import type { Booking, Flight } from "../interfaces/interfaces";
import SeatMap from "../components/SeatMap.vue";

const { createBooking, loading, error } = useBookings();
const { flights, fetchFlights } = useFlights();
const { getTokenAndUserId } = useUsers();
const { getBookedSeats } = useTickets();

const userId = ref<string | null>(null);

const departureAirport = ref<string | null>(null);
const arrivalAirport = ref<string | null>(null);
const selectedFlight = ref<string | null>(null);
const selectedDate = ref<Date | undefined>(undefined);
const selectedSeats = ref<string[]>([]);
const bookedSeats = ref<string[]>([]);
const numberOfPassengers = ref<number>(1);

// Initialize tickets with one empty ticket
const tickets = ref([
  {
    firstName: "",
    lastName: "",
    gender: "Male",
    seatNumber: "",
    ticketPrice: 0,
  },
]);

// Watch for changes in the number of passengers to update the ticket list
watch(numberOfPassengers, (newCount) => {
  // Add or remove tickets based on the selected number of passengers
  if (newCount > tickets.value.length) {
    const diff = newCount - tickets.value.length;
    for (let i = 0; i < diff; i++) {
      tickets.value.push({
        firstName: "",
        lastName: "",
        gender: "Male",
        seatNumber: "",
        ticketPrice: selectedFlightData.value?.basePrice || 0,
      });
    }
  } else if (newCount < tickets.value.length) {
    tickets.value.splice(newCount);
  }
});

// Fetch booked seats when the flight and date change
watch([selectedFlight, selectedDate], async () => {
  if (selectedFlight.value && selectedDate.value instanceof Date) {
    const year = selectedDate.value.getFullYear();
    const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.value.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`; // Local date, no UTC shift

    bookedSeats.value = await getBookedSeats(
      selectedFlight.value,
      formattedDate
    );
    console.log("Booked seats:", bookedSeats.value);
  }
});

const uniqueDepartureAirports = computed(() => {
  return Array.from(
    new Set(flights.value.map((flight) => flight.route.departureAirport_id))
  );
});

const availableArrivalAirports = computed(() => {
  if (!departureAirport.value) return [];

  const arrivalAirports = flights.value
    .filter(
      (flight) =>
        flight.route.departureAirport_id === departureAirport.value &&
        flight.route.arrivalAirport_id !== departureAirport.value
    )
    .map((flight) => flight.route.arrivalAirport_id);

  return [...new Set(arrivalAirports)];
});

const availableFlights = computed(() => {
  return flights.value.filter(
    (flight) =>
      flight.route.departureAirport_id === departureAirport.value &&
      flight.route.arrivalAirport_id === arrivalAirport.value
  );
});

const selectedFlightData = ref<Flight | null>(null);

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

// Watch for changes in selectedFlight to update the selectedFlightData
watch(selectedFlight, (newFlightId) => {
  const flight = flights.value.find((f) => f._id === newFlightId);
  selectedFlightData.value = flight || null;

  // Ensure ticket price updates when flight changes
  if (selectedFlightData.value) {
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = selectedFlightData.value?.basePrice || 0;
    });
  }
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

const validFlightDates = computed(() => {
  const flight = selectedFlightData.value;
  if (!flight || !flight.operatingPeriod || !flight.departureDay) return [];

  const { startDate, endDate } = flight.operatingPeriod;
  const fromDate = new Date(startDate);
  const toDate = new Date(endDate);
  const validDates: Date[] = [];

  while (fromDate <= toDate) {
    if (
      fromDate.toLocaleDateString("en-US", { weekday: "long" }) ===
      flight.departureDay
    ) {
      // Clone the date to avoid mutation
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

// Price calculation
watch(selectedFlight, (newFlightId) => {
  const flight = flights.value.find((f) => f._id === newFlightId);
  selectedFlightData.value = flight || null;

  // Ensure ticket price updates when flight changes
  if (selectedFlightData.value) {
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = selectedFlightData.value?.basePrice || 0;
    });
  }
});

const totalPrice = computed(() =>
  tickets.value.reduce((sum, t) => sum + t.ticketPrice, 0)
);

const submitBooking = async () => {
  if (!selectedFlight.value || !selectedDate.value) {
    alert("Please select a flight and a valid date");
    return;
  }
  try {
    const bookingData: Booking = {
      user_id: userId.value || "",
      totalPrice: totalPrice.value,
      bookingDate: new Date().toISOString(),
      numberOfTickets: tickets.value.length,
      bookingStatus: "Confirmed",
      tickets: tickets.value.map((t, index) => ({
        ticket_id: `T100${index + 1}`,
        firstName: t.firstName,
        lastName: t.lastName,
        ticketPrice: t.ticketPrice,
        gender: t.gender as "Male" | "Female",
        seatNumber: t.seatNumber,
        flight_id: selectedFlight.value as string,
        departureDate: selectedDate.value
          ? formatLocalDate(selectedDate.value)
          : "",
      })),
    };
    await createBooking(bookingData);
    alert("Booking successful!");
  } catch (error) {
    alert("Booking failed. Please try again.");
  }
};

onMounted(() => {
  try {
    const { userId: fetchedUserId } = getTokenAndUserId();
    userId.value = fetchedUserId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
  }
});

onMounted(() => fetchFlights());
</script>
