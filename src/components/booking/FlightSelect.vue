<template>
  <div>
    <!-- Departure Airport -->
    <label class="block text-[#ff7f50] text-left font-medium">
      Departure Airport:
    </label>
    <select
      v-model="modelDepartureAirport"
      class="w-full p-3 border border-[#ff7f50] rounded-lg text-black"
    >
      <option
        v-for="airportCode in uniqueDepartureAirports"
        :key="airportCode"
        :value="airportCode"
      >
        {{ airportNameMap[airportCode] || airportCode }} ({{ airportCode }})
      </option>
    </select>

    <!-- Arrival Airport -->
    <label
      v-if="modelDepartureAirport"
      class="block text-[#ff7f50] text-left font-medium mt-4"
    >
      Arrival Airport:
    </label>
    <select
      v-if="modelDepartureAirport"
      v-model="modelArrivalAirport"
      class="w-full p-3 border border-[#ff7f50] rounded-lg text-black"
    >
      <option
        v-for="airportCode in availableArrivalAirports"
        :key="airportCode"
        :value="airportCode"
      >
        {{ airportNameMap[airportCode] || airportCode }} ({{ airportCode }})
      </option>
    </select>

    <!-- Flight Selection -->
    <label
      v-if="modelArrivalAirport"
      class="block text-[#ff7f50] text-left font-medium mt-4"
    >
      Select Flight:
    </label>
    <select
      v-if="modelArrivalAirport"
      v-model="modelSelectedFlight"
      class="w-full p-3 border border-[#ff7f50] rounded-lg text-black"
    >
      <option
        v-for="flight in availableFlights"
        :key="flight._id"
        :value="flight._id"
      >
        {{ flight.flightNumber }}
        ({{
          airportNameMap[flight.route.departureAirport_id] ||
          flight.route.departureAirport_id
        }}) {{ flight.departureTime }} -> ({{
          airportNameMap[flight.route.arrivalAirport_id] ||
          flight.route.arrivalAirport_id
        }}) {{ flight.arrivalTime }} ${{ flight.basePrice }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useFlights } from "../../modules/useFlights";
import { useAirports } from "../../modules/useAirports";

const { flights, fetchFlights } = useFlights();
const { fetchAirports, airportNameMap } = useAirports();

const modelDepartureAirport = defineModel<string | null>("departureAirport");
const modelArrivalAirport = defineModel<string | null>("arrivalAirport");
const modelSelectedFlight = defineModel<string | null>("selectedFlight");

const today = new Date();
today.setHours(0, 0, 0, 0);

const filteredFlights = computed(() => {
  return flights.value.filter((flight) => {
    const endDate = new Date(flight.operatingPeriod?.endDate);
    // Check if the flight is not cancelled
    if (flight.status === "Cancelled") return false;
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
});

const uniqueDepartureAirports = computed(() => {
  return Array.from(
    new Set(filteredFlights.value.map((f) => f.route.departureAirport_id))
  ) as string[];
});

const availableArrivalAirports = computed(() => {
  if (!modelDepartureAirport.value) return [];
  return Array.from(
    new Set(
      filteredFlights.value
        .filter(
          (f) =>
            f.route.departureAirport_id === modelDepartureAirport.value &&
            f.route.arrivalAirport_id !== modelDepartureAirport.value
        )
        .map((f) => f.route.arrivalAirport_id)
    )
  ) as string[];
});

const availableFlights = computed(() => {
  return filteredFlights.value.filter(
    (f) =>
      f.route.departureAirport_id === modelDepartureAirport.value &&
      f.route.arrivalAirport_id === modelArrivalAirport.value
  );
});

onMounted(() => {
  fetchFlights();
  fetchAirports();
});
</script>
