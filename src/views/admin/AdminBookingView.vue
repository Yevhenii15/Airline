<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">📋 Admin – All Bookings</h1>

    <!-- Search Section -->
    <div class="mb-6 flex items-center gap-2">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by User Email or Booking ID"
        class="flex-1 text-black p-2 border rounded-md"
      />
      <button
        @click="search"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Search
      </button>
      <button
        @click="reset"
        class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
      >
        Reset
      </button>
    </div>

    <!-- Display Search Error -->
    <div v-if="searchError" class="text-red-600 mb-4">{{ searchError }}</div>

    <!-- Display Loading / Global Error -->
    <div v-if="loading" class="text-blue-500 mb-4">Loading...</div>
    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <!-- Booking Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="bg-white text-black shadow-lg rounded-xl p-6 flex flex-col"
      >
        <!-- Booking Header -->
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-l font-semibold">
              🆔 Booking ID: {{ booking._id }}
            </h2>
            <p class="text-gray-600 text-sm">
              👤 User ID: {{ booking.user_id }}
            </p>
            <p class="text-gray-600 text-sm">
              📧 User Email: {{ booking.user_email }}
            </p>
          </div>
          <button
            @click="handleCancel(booking._id!)"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
          >
            Cancel
          </button>
        </div>

        <!-- Booking Info -->
        <div class="grid gap-2 text-sm text-gray-800">
          <p>📅 Booking Date: {{ formatDate(booking.bookingDate) }}</p>
          <p>💰 Total Price: €{{ booking.totalPrice.toFixed(2) }}</p>
          <p>🎟️ Tickets: {{ booking.numberOfTickets }}</p>
          <p>
            📌 Status:
            <span
              :class="{
                'text-green-600': booking.bookingStatus === 'Confirmed',
                'text-yellow-600': booking.bookingStatus === 'Pending',
                'text-red-600': booking.bookingStatus === 'Cancelled',
              }"
            >
              {{ booking.bookingStatus }}
            </span>
          </p>
        </div>

        <!-- Flight Details -->
        <div
          v-if="booking.tickets?.length"
          class="mt-4 bg-blue-50 p-4 rounded-md shadow-md"
        >
          <h4 class="font-semibold text-blue-700 mb-2">✈️ Flight Details:</h4>
          <p>
            <strong>Flight Number:</strong>
            {{ flightsById[booking.tickets[0].flight_id]?.flightNumber }}
          </p>
          <p>
            <strong>Departure Airport:</strong>
            {{
              flightsById[booking.tickets[0].flight_id]?.route
                .departureAirport_id
            }}
          </p>
          <p>
            <strong>Arrival Airport:</strong>
            {{
              flightsById[booking.tickets[0].flight_id]?.route.arrivalAirport_id
            }}
          </p>
          <p>
            <strong>Departure Date:</strong>
            {{ formatDate(booking.tickets[0].departureDate) }}
          </p>
          <p>
            <strong>Departure Time:</strong>
            {{ flightsById[booking.tickets[0].flight_id]?.departureTime }}
          </p>
          <p>
            <strong>Arrival Time:</strong>
            {{ flightsById[booking.tickets[0].flight_id]?.arrivalTime }}
          </p>
          <p>
            <strong>Status:</strong>
            {{ flightsById[booking.tickets[0].flight_id]?.status }}
          </p>
        </div>

        <!-- Tickets List -->
        <div v-if="booking.tickets?.length" class="mt-4">
          <h3 class="text-md font-medium mb-2">🧾 Tickets:</h3>
          <div
            v-for="ticket in booking.tickets"
            :key="ticket.ticket_id"
            class="bg-gray-100 p-3 rounded-md mb-2"
          >
            <p>👤 Name: {{ ticket.firstName }} {{ ticket.lastName }}</p>
            <p>🪑 Seat: {{ ticket.seatNumber }}</p>
            <p>🚹 Gender: {{ ticket.gender }}</p>
            <p>🎫 Price: €{{ ticket.ticketPrice }}</p>
            <p>✈️ Flight ID: {{ ticket.flight_id }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useBookings } from "../../modules/useBookings";
import { useFlights } from "../../modules/useFlights";
import type { Booking } from "../../interfaces/interfaces";

const {
  bookings,
  error,
  loading,
  fetchAllBookings,
  cancelBooking,
  fetchBookingsByEmail,
  fetchBookingById,
} = useBookings();
const { fetchFlightById } = useFlights();

const flightsById = ref<Record<string, any>>({});
const searchTerm = ref<string>("");
const searchError = ref<string>("");

// on mount, load everything
onMounted(async () => {
  await loadAll();
});

async function loadAll() {
  await fetchAllBookings();
  await loadFlightsFor(bookings.value);
}

// helper to load flight details for a list
async function loadFlightsFor(list: Booking[]) {
  const ids = [
    ...new Set(list.flatMap((b) => b.tickets.map((t) => t.flight_id))),
  ];
  for (const id of ids) {
    if (!flightsById.value[id]) {
      try {
        flightsById.value[id] = await fetchFlightById(id);
      } catch {
        /* ignore */
      }
    }
  }
}

// search by email or id
async function search() {
  if (!searchTerm.value.trim()) {
    searchError.value = "Please enter an email or booking ID.";
    return;
  }
  searchError.value = "";
  // email?
  if (searchTerm.value.includes("@")) {
    try {
      await fetchBookingsByEmail(searchTerm.value);
      if (bookings.value.length === 0) {
        searchError.value = "No bookings found with that email.";
      } else {
        await loadFlightsFor(bookings.value);
      }
    } catch (err) {
      searchError.value = (err as Error).message;
    }
  } else {
    // treat as booking ID
    try {
      const single = await fetchBookingById(searchTerm.value);
      bookings.value = [single];
      await loadFlightsFor(bookings.value);
    } catch (err) {
      searchError.value = "No booking found with that ID.";
    }
  }
}

// reset to full list
async function reset() {
  searchTerm.value = "";
  searchError.value = "";
  flightsById.value = {};
  await loadAll();
}

async function handleCancel(id: string) {
  if (confirm("Are you sure you want to cancel this booking?")) {
    await cancelBooking(id);
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
