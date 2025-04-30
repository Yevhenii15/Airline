<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-3xl font-bold text-blue-600 mb-6">Book a Flight</h2>
    <div
      v-if="flightLoading && bookingLoading"
      class="text-center text-blue-400 text-lg"
    >
      ⏳ Loading...
    </div>
    <div v-else-if="error" class="text-center text-red-500 font-semibold">
      {{ error }}
    </div>

    <FlightSelect
      v-model:departureAirport="departureAirport"
      v-model:arrivalAirport="arrivalAirport"
      v-model:selectedFlight="selectedFlight"
    />

    <DatePicker
      v-if="selectedFlight"
      v-model="selectedDate"
      :disabledDates="disabledDates"
    />

    <!-- Number of Passengers -->
    <label
      v-if="selectedFlight && selectedDate"
      class="block text-blue-600 font-medium"
    >
      Number of Passengers:
    </label>
    <input
      v-if="selectedFlight && selectedDate"
      v-model.number="numberOfPassengers"
      type="number"
      min="1"
      max="10"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
      required
    />

    <SeatMap
      v-if="selectedFlight && selectedDate && !loadingSeats"
      :seat-map="availableSeats"
      :selected-seats="selectedSeats"
      @select-seat="handleSeatSelect"
    />
    <p v-if="loadingSeats" class="text-blue-500 font-medium mt-4">
      Loading seats...
    </p>

    <PassengerForm v-if="selectedSeats.length > 0" v-model="tickets" />

    <h3 class="text-xl font-bold text-blue-600 mt-6">
      Total Price: ${{ totalPrice }}
    </h3>

    <button
      @click="submitBooking"
      :disabled="bookingLoading"
      class="mt-6 bg-green-600 text-white px-8 py-3 rounded-lg"
    >
      {{ bookingLoading ? "Processing..." : "Confirm Booking" }}
    </button>

    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

import FlightSelect from "../components/booking/FlightSelect.vue";
import SeatMap from "../components/booking/SeatMap.vue";
import PassengerForm from "../components/booking/PassengerForm.vue";
import DatePicker from "../components/booking/DatePicker.vue";

import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useUsers } from "../modules/auth/useUsers";
import { useTickets } from "../modules/useTicket";
import type { Booking } from "../interfaces/interfaces";

// Composables
const {
  createBooking,
  loading: bookingLoading,
  error,
  selectedFlightData,
  disabledDates,
  formatLocalDate,
} = useBookings();

const { loading: flightLoading, flights, fetchFlights } = useFlights();
const { getTokenAndUserId } = useUsers();
const {
  getBookedSeats,
  bookedSeats,
  selectedSeats,
  numberOfPassengers,
  tickets,
  availableSeats,
  handleSeatSelect,
} = useTickets();

// State
const userId = ref<string | null>(null);
const departureAirport = ref<string | null>(null);
const arrivalAirport = ref<string | null>(null);
const selectedFlight = ref<string | null>(null);
const selectedDate = ref<Date | undefined>(undefined);
const loadingSeats = ref(false);

// Set user ID on mount
onMounted(() => {
  try {
    const { userId: fetchedUserId } = getTokenAndUserId();
    userId.value = fetchedUserId;
  } catch (err) {
    console.error("Error fetching user ID:", err);
  }
});

// Fetch flights on mount
onMounted(() => fetchFlights());

// Watch selectedFlight to update selectedFlightData & ticket prices
watch(selectedFlight, (flightId) => {
  const flight = flights.value.find((f) => f._id === flightId);
  selectedFlightData.value = flight || null;

  // Update ticket prices when flight changes
  if (flight) {
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = flight.basePrice || 0;
    });
  }
});

watch([selectedFlight, selectedDate], async ([flightId, date]) => {
  if (flightId && date instanceof Date) {
    loadingSeats.value = true;
    const formattedDate = formatLocalDate(date);
    bookedSeats.value = await getBookedSeats(flightId, formattedDate);
    loadingSeats.value = false;
    console.log("Booked seats for", formattedDate, ":", bookedSeats.value);
  }
});

// Watch passenger count to sync tickets
watch(numberOfPassengers, (count) => {
  const current = tickets.value.length;
  if (count > current) {
    for (let i = 0; i < count - current; i++) {
      tickets.value.push({
        firstName: "",
        lastName: "",
        gender: "Male",
        seatNumber: "",
        ticketPrice: selectedFlightData.value?.basePrice || 0,
      });
    }
  } else {
    tickets.value.splice(count);
  }
});

// Total price computed
const totalPrice = computed(() =>
  tickets.value.reduce((sum, t) => sum + t.ticketPrice, 0)
);

// Submit booking
const submitBooking = async () => {
  if (!selectedFlight.value || !selectedDate.value) {
    alert("Please select a flight and a valid date");
    return;
  }

  try {
    const { userId, email } = getTokenAndUserId(); // Extract email along with userId

    const bookingData: Booking = {
      user_id: userId || "", // Use userId
      user_email: email || "", // Use email
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
        flight_id: selectedFlight.value!,
        departureDate: formatLocalDate(selectedDate.value!),
      })),
    };

    await createBooking(bookingData);

    // Option 1: Pass via localStorage (preferred for larger data)
    localStorage.setItem("latestBooking", JSON.stringify(bookingData));

    router.push("/booking-confirmation");
  } catch (err) {
    alert("Booking failed. Please try again.");
  }
};

// Debug: Watch disabledDates
watch(disabledDates, () => {
  console.log("Disabled Dates:", disabledDates.value);
});
</script>
