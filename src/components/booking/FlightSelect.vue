<template>
  <div>
    <!-- Departure Airport -->
    <label class="block text-blue-600 font-medium">Departure Airport:</label>
    <select
      v-model="modelDepartureAirport"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="airport in uniqueDepartureAirports"
        :key="airport"
        :value="airport"
      >
        {{ airport }}
      </option>
    </select>

    <!-- Arrival Airport -->
    <label
      v-if="modelDepartureAirport"
      class="block text-blue-600 font-medium mt-4"
      >Arrival Airport:</label
    >
    <select
      v-if="modelDepartureAirport"
      v-model="modelArrivalAirport"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="airport in availableArrivalAirports"
        :key="airport"
        :value="airport"
      >
        {{ airport }}
      </option>
    </select>

    <!-- Flight Selection -->
    <label
      v-if="modelArrivalAirport"
      class="block text-blue-600 font-medium mt-4"
      >Select Flight:</label
    >
    <select
      v-if="modelArrivalAirport"
      v-model="modelSelectedFlight"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    >
      <option
        v-for="flight in availableFlights"
        :key="flight._id"
        :value="flight._id"
      >
        {{ flight.flightNumber }} ({{ flight.route.departureAirport_id }})
        {{ flight.departureTime }} -> ({{ flight.route.arrivalAirport_id }})
        {{ flight.arrivalTime }} ${{ flight.basePrice }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlights } from "../../modules/useFlights";
const { flights, fetchFlights } = useFlights();

const modelDepartureAirport = defineModel<string | null>("departureAirport");
const modelArrivalAirport = defineModel<string | null>("arrivalAirport");
const modelSelectedFlight = defineModel<string | null>("selectedFlight");
const today = new Date();
today.setHours(0, 0, 0, 0); // Normalize time

const filteredFlights = computed(() => {
  return flights.value.filter((flight) => {
    const endDate = new Date(flight.operatingPeriod?.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
});

const uniqueDepartureAirports = computed(() => {
  return Array.from(
    new Set(
      filteredFlights.value.map((flight) => flight.route.departureAirport_id)
    )
  ) as string[];
});

const availableArrivalAirports = computed(() => {
  if (!modelDepartureAirport.value) return [];
  const arrivalAirports = filteredFlights.value
    .filter(
      (flight) =>
        flight.route.departureAirport_id === modelDepartureAirport.value &&
        flight.route.arrivalAirport_id !== modelDepartureAirport.value
    )
    .map((flight) => flight.route.arrivalAirport_id);
  return [...new Set(arrivalAirports)] as string[];
});

const availableFlights = computed(() => {
  return filteredFlights.value.filter(
    (flight) =>
      flight.route.departureAirport_id === modelDepartureAirport.value &&
      flight.route.arrivalAirport_id === modelArrivalAirport.value
  );
});

onMounted(() => fetchFlights());
</script>
