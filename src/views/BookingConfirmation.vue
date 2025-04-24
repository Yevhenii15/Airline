<template>
  <div
    class="max-w-4xl mx-auto p-8 bg-white text-gray-800 shadow-2xl rounded-2xl"
  >
    <!-- Title -->
    <h2 class="text-4xl font-bold text-green-600 mb-8 text-center">
      ✈️ Booking Confirmation
    </h2>

    <div v-if="booking">
      <!-- Booking Overview -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200"
      >
        <div>
          <p class="mb-2">
            <span class="font-semibold text-gray-600">Booking Date:</span>
            {{ formatDate(booking.bookingDate) }}
          </p>
          <p class="mb-2">
            <span class="font-semibold text-gray-600">User email:</span>
            {{ booking.user_email }}
          </p>
          <p class="mb-2">
            <span class="font-semibold text-gray-600">Status:</span>
            {{ booking.bookingStatus }}
          </p>
          <p class="mb-2">
            <span class="font-semibold text-gray-600">Number of Tickets:</span>
            {{ booking.numberOfTickets }}
          </p>
        </div>
        <div>
          <p class="mb-2 text-lg">
            <span class="font-semibold text-gray-600">Total Price:</span>
            <span class="text-green-700 font-bold"
              >${{ booking.totalPrice }}</span
            >
          </p>
        </div>
      </div>

      <!-- Flight Information -->
      <div
        v-if="
          booking.tickets.length && flightsById[booking.tickets[0].flight_id]
        "
        class="bg-blue-50 p-6 rounded-xl shadow border border-blue-200 mb-8"
      >
        <h3 class="text-2xl font-semibold text-blue-700 mb-4">
          Flight Details
        </h3>
        <div class="grid md:grid-cols-2 gap-4">
          <p>
            <strong>Flight #:</strong>
            {{ flightsById[booking.tickets[0].flight_id].flightNumber }}
          </p>
          <p>
            <strong>Departure Date:</strong>
            {{ formatDate(booking.tickets[0].departureDate) }}
          </p>
          <p>
            <strong>Departure Time:</strong>
            {{ flightsById[booking.tickets[0].flight_id].departureTime }}
          </p>
          <p>
            <strong>Arrival Time:</strong>
            {{ flightsById[booking.tickets[0].flight_id].arrivalTime }}
          </p>
          <p>
            <strong>Status:</strong>
            {{ flightsById[booking.tickets[0].flight_id].status }}
          </p>
          <p>
            <strong>Route:</strong>
            {{
              flightsById[booking.tickets[0].flight_id].route
                .departureAirport_id
            }}
            →
            {{
              flightsById[booking.tickets[0].flight_id].route.arrivalAirport_id
            }}
          </p>
        </div>
      </div>

      <!-- Passenger Details -->
      <div class="space-y-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-800 mb-4">
          Passenger Information
        </h3>
        <div
          v-for="(ticket, index) in booking.tickets"
          :key="index"
          class="bg-white border border-gray-200 p-5 rounded-xl shadow-sm"
        >
          <p class="mb-1">
            <span class="font-semibold text-gray-700"
              >Passenger {{ index + 1 }}:</span
            >
            {{ ticket.firstName }} {{ ticket.lastName }}
          </p>
          <p class="mb-1"><strong>Gender:</strong> {{ ticket.gender }}</p>
          <p class="mb-1"><strong>Seat:</strong> {{ ticket.seatNumber }}</p>
          <p><strong>Ticket Price:</strong> ${{ ticket.ticketPrice }}</p>
        </div>
      </div>

      <!-- Back Home -->
      <div class="text-center">
        <router-link
          to="/"
          class="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-green-700 transition duration-200"
        >
          ⬅️ Back to Home
        </router-link>
      </div>
    </div>

    <!-- No booking fallback -->
    <p v-else class="text-gray-500 text-center mt-10 text-lg">
      No booking data found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Booking, Flight } from "../interfaces/interfaces";
import { useFlights } from "@/modules/useFlights";

const { fetchFlightById } = useFlights();

const booking = ref<Booking | null>(null);
const flightsById = ref<Record<string, Flight>>({});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

onMounted(async () => {
  const stored = localStorage.getItem("latestBooking");
  if (stored) {
    booking.value = JSON.parse(stored);

    const uniqueFlightIds = [
      ...new Set(booking.value?.tickets.map((t) => t.flight_id)),
    ];

    for (const id of uniqueFlightIds) {
      try {
        const flight = await fetchFlightById(id);
        flightsById.value[id] = flight;
      } catch (error) {
        console.error("Failed to fetch flight", id, error);
      }
    }
  }
});
</script>
