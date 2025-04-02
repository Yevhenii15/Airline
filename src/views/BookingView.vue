<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useAirports } from "../modules/useAirports";
import { useUsers } from "../modules/auth/useUsers";
import type { Booking } from "../interfaces/interfaces";

const { createBooking, loading, error } = useBookings();
const { flights, fetchFlights } = useFlights();
const { airports, fetchAirports } = useAirports();
const { getTokenAndUserId } = useUsers();

const { userId } = getTokenAndUserId(); // Get logged-in user ID

const selectedFlight = ref<string | null>(null);
const tickets = ref([
  {
    firstName: "",
    lastName: "",
    gender: "Male",
    seatNumber: "",
    ticketPrice: 0, // Will be auto-set when flight is selected
  },
]);

// Find the selected flight
const selectedFlightData = computed(() => {
  return flights.value.find((flight) => flight._id === selectedFlight.value);
});

// Automatically update ticket prices based on selected flight
watch(selectedFlight, (newFlightId) => {
  const flight = flights.value.find((f) => f._id === newFlightId);
  if (flight) {
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = flight.basePrice;
    });
  }
});

// Total price calculation
const totalPrice = computed(() =>
  tickets.value.reduce((sum, t) => sum + t.ticketPrice, 0)
);

const addPassenger = () => {
  tickets.value.push({
    firstName: "",
    lastName: "",
    gender: "Male",
    seatNumber: "",
    ticketPrice: selectedFlightData.value?.basePrice || 0,
  });
};

const removePassenger = (index: number) => {
  if (tickets.value.length > 1) tickets.value.splice(index, 1);
};

const submitBooking = async () => {
  if (!selectedFlight.value) {
    alert("Please select a flight");
    return;
  }

  try {
    const bookingData: Booking = {
      user_id: userId,
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
      })),
    };

    await createBooking(bookingData);
    alert("Booking successful!");
  } catch (error) {
    alert("Booking failed. Please try again.");
  }
};

onMounted(() => {
  fetchFlights();
  fetchAirports();
});
</script>

<template>
  <div>
    <h2>Book a Flight</h2>

    <label>Choose a Flight:</label>
    <select v-model="selectedFlight">
      <option v-for="flight in flights" :key="flight._id" :value="flight._id">
        {{ flight.route.departureAirport_id }} →
        {{ flight.route.arrivalAirport_id }}
        ({{ flight.departureTime }}) - ${{ flight.basePrice }}
      </option>
    </select>

    <h3>Passengers</h3>
    <div v-for="(ticket, index) in tickets" :key="index" class="passenger">
      <input v-model="ticket.firstName" placeholder="First Name" required />
      <input v-model="ticket.lastName" placeholder="Last Name" required />
      <select v-model="ticket.gender">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input v-model="ticket.seatNumber" placeholder="Seat Number" required />
      <input
        v-model.number="ticket.ticketPrice"
        placeholder="Price"
        type="number"
        required
        disabled
      />
      <button @click="removePassenger(index)" v-if="tickets.length > 1">
        Remove
      </button>
    </div>

    <button @click="addPassenger">+ Add Passenger</button>

    <h3>Total Price: ${{ totalPrice }}</h3>

    <button @click="submitBooking" :disabled="loading">
      {{ loading ? "Processing..." : "Confirm Booking" }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.passenger {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
