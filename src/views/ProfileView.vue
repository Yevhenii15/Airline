<template>
  <div class="p-6 text-black max-w-4xl mx-auto">
    <h1 class="text-2xl text-white font-bold mb-6">👤 My Bookings</h1>

    <!-- Loading & Error -->
    <div v-if="loading" class="text-blue-500 mb-4">Loading your bookings…</div>
    <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

    <!-- No bookings -->
    <div v-if="!loading && bookings.length === 0" class="text-gray-700">
      You have not made any bookings yet.
    </div>

    <!-- Booking Cards Grid -->
    <div v-if="bookings.length" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div
        v-for="booking in bookings"
        :key="booking._id"
        class="bg-white shadow-md rounded-xl p-6 flex flex-col"
      >
        <!-- Header -->
        <BookingHeader :booking="booking" @cancel="cancel" />

        <!-- Booking Info -->
        <BookingInfo :booking="booking" :formatDate="formatDate" />

        <!-- Flight Details for first ticket -->
        <FlightDetails
          :ticket="booking.tickets[0]"
          :flight="flightFor(booking.tickets[0].flight_id)"
          :formatDate="formatDate"
        />

        <!-- Tickets List -->
        <TicketList :tickets="booking.tickets" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";

import BookingHeader from "@/components/booking/details/BookingHeader.vue";
import BookingInfo from "@/components/booking/details/BookingInfo.vue";
import FlightDetails from "@/components/booking/details/FlightDetails.vue";
import TicketList from "@/components/booking/details/TicketList.vue";

import type { Booking, Flight } from "@/interfaces/interfaces";

const { bookings, loading, error, fetchUserBookings, cancelBooking } =
  useBookings();

const { fetchFlightById } = useFlights();
const flightsById = ref<Record<string, Flight>>({});

// Load user bookings and flights on mount
onMounted(async () => {
  await fetchUserBookings();
  await loadFlights();
});

async function loadFlights() {
  const ids = [
    ...new Set(
      bookings.value.flatMap((b) => b.tickets.map((t) => t.flight_id))
    ),
  ];
  for (const id of ids) {
    if (!flightsById.value[id]) {
      try {
        flightsById.value[id] = await fetchFlightById(id);
      } catch {
        // ignore
      }
    }
  }
}

// Helper to look up a flight
function flightFor(flightId: string): Flight | undefined {
  return flightsById.value[flightId];
}

// Cancel one of the user’s bookings
async function cancel(id: string) {
  if (confirm("Cancel this booking?")) {
    await cancelBooking(id);
  }
}

// Format ISO date → dd MMM yyyy
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
