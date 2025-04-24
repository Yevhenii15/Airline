<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">📋 Admin – All Bookings</h1>

    <div v-if="loading" class="text-blue-500">Loading bookings...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <!-- Booking Cards Grid (3 per row) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="bg-white text-black shadow-lg rounded-xl p-6 flex flex-col"
      >
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

        <!-- Flight Details Section (Only shown once per booking) -->
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

        <!-- Tickets Section -->
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

const { bookings, error, loading, fetchAllBookings, cancelBooking } =
  useBookings();
const { fetchFlightById } = useFlights();
const flightsById = ref<Record<string, any>>({});

onMounted(async () => {
  await fetchAllBookings();

  // Fetch all unique flight IDs across bookings
  const uniqueFlightIds = [
    ...new Set(
      bookings.value.flatMap((booking) =>
        booking.tickets.map((ticket) => ticket.flight_id)
      )
    ),
  ];

  // Fetch flight details for each flight ID
  for (const id of uniqueFlightIds) {
    try {
      const flight = await fetchFlightById(id);
      flightsById.value[id] = flight;
    } catch (error) {
      console.error("Failed to fetch flight details for flight ID:", id, error);
    }
  }
});

const handleCancel = async (id: string) => {
  if (confirm("Are you sure you want to cancel this booking?")) {
    await cancelBooking(id);
  }
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
</script>
