<template>
  <div
    class="max-w-4xl mx-auto my-10 p-8 bg-black border border-[#ff7f50] text-gray-800 shadow-2xl rounded-2xl"
  >
    <!-- Title -->
    <h2 class="text-4xl font-bold text-green-600 mb-8 text-center">
      ✈️ Booking Confirmation
    </h2>

    <!-- Only render the details once booking is loaded -->
    <div v-if="booking">
      <!-- Booking Overview -->
      <BookingHeader
        :booking="booking!"
        :show-id="false"
        :show-cancel-button="false"
      />

      <!-- Booking Info -->
      <BookingInfo :booking="booking!" :formatDate="formatDate" />

      <!-- Flight Information -->
      <div v-if="loading" class="text-blue-500 mb-4">
        Loading flight details...
      </div>
      <div v-if="error" class="text-red-600 mb-4">
        {{ error }}
      </div>
      <FlightDetails
        v-if="booking!.tickets.length && flightsById[booking!.tickets[0].flight_id]"
        :ticket="booking!.tickets[0]"
        :flight="flightsById[booking!.tickets[0].flight_id]!"
        :formatDate="formatDate"
        class="mb-8"
      />

      <!-- Passenger Details -->
      <div v-if="booking!.tickets.length" class="space-y-6 mb-8">
        <TicketList :tickets="booking!.tickets" />
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

    <!-- Fallback if no booking -->
    <p v-else class="text-gray-500 text-center mt-10 text-lg">
      No booking data found.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Booking, Flight } from "../interfaces/interfaces";
import { useFlights } from "@/modules/useFlights";
import { formatDate } from "../modules/functions/dateFormater";

import BookingHeader from "@/components/booking/details/BookingHeader.vue";
import BookingInfo from "@/components/booking/details/BookingInfo.vue";
import FlightDetails from "@/components/booking/details/FlightDetails.vue";
import TicketList from "@/components/booking/details/TicketList.vue";

const { fetchFlightById, error, loading } = useFlights();

const booking = ref<Booking | null>(null);
const flightsById = ref<Record<string, Flight>>({});

onMounted(async () => {
  const stored = localStorage.getItem("latestBooking");
  if (!stored) return;

  try {
    booking.value = JSON.parse(stored) as Booking;
  } catch (err) {
    console.error("Could not parse booking from localStorage:", err);
    return;
  }

  // If tickets array exists, fetch flights
  const ids = booking.value?.tickets.map((t) => t.flight_id) ?? [];
  const uniqueIds = Array.from(new Set(ids));

  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        flightsById.value[id] = await fetchFlightById(id);
      } catch (e) {
        console.error("Failed to fetch flight", id, e);
      }
    })
  );
});
</script>
