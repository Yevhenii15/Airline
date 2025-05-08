<template>
  <div v-if="ticket && flight" class="mt-4 bg-blue-50 p-4 rounded-md shadow-md">
    <h4 class="font-semibold text-blue-700 mb-2">✈️ Flight Details:</h4>
    <p><strong>Flight Number:</strong> {{ flight.flightNumber }}</p>
    <p>
      <strong>Departure Airport:</strong>
      {{
        (flight.route.departureAirport_id &&
          airportNameMap[flight.route.departureAirport_id]) ||
        "Loading..."
      }}
    </p>
    <p>
      <strong>Arrival Airport:</strong>
      {{
        (flight.route.arrivalAirport_id &&
          airportNameMap[flight.route.arrivalAirport_id]) ||
        "Loading..."
      }}
    </p>
    <p>
      <strong>Departure Date:</strong> {{ formatDate(ticket.departureDate) }}
    </p>
    <p><strong>Departure Time:</strong> {{ flight.departureTime }}</p>
    <p><strong>Arrival Time:</strong> {{ flight.arrivalTime }}</p>
    <p><strong>Status:</strong> {{ flight.status }}</p>
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
