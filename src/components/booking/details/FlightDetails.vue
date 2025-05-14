<template>
  <div>
    <h4 class="text-[#ff7f50] font-bold text-xl mb-4">✈️ Flight Details</h4>

    <div
      v-if="ticket && flight"
      class="mt-4 bg-zinc-800 border border-[#ff7f50] p-6 rounded-xl shadow-lg text-gray-200"
    >
      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Flight Number:</span>
        {{ flight.flightNumber }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Departure Airport:</span>
        {{
          (flight.route.departureAirport_id &&
            airportNameMap[flight.route.departureAirport_id]) ||
          "Loading..."
        }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Arrival Airport:</span>
        {{
          (flight.route.arrivalAirport_id &&
            airportNameMap[flight.route.arrivalAirport_id]) ||
          "Loading..."
        }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Departure Date:</span>
        {{ formatDate(ticket.departureDate) }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Departure Time:</span>
        {{ flight.departureTime }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Arrival Time:</span>
        {{ flight.arrivalTime }}
      </p>

      <p class="mb-1">
        <span class="text-[#ff7f50] font-medium">Status:</span>
        <span
          :class="{
            'text-green-400': flight.status === 'On Time',
            'text-yellow-400': flight.status === 'Delayed',
            'text-red-400': flight.status === 'Cancelled',
          }"
          class="font-semibold"
        >
          {{ flight.status }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket, Flight } from "@/interfaces/interfaces";
import { defineProps, onMounted } from "vue";
import { useAirports } from "../../../modules/useAirports";

// Fetching the airport name map from the useAirports composable
const { airportNameMap, fetchAirports } = useAirports();
onMounted(() => {
  fetchAirports();
});
const props = defineProps<{
  ticket?: Ticket;
  flight?: Flight;
  formatDate: (iso: string) => string;
}>();
</script>
