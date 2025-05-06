<template>
  <div class="bg-[#181818] min-h-screen p-6 text-white">
    <h1 class="text-3xl font-bold text-center mb-8">✈️ Admin View - Flights</h1>

    <div
      v-if="flightLoading && routeLoading"
      class="text-center text-blue-400 text-lg"
    >
      ⏳ Loading...
    </div>
    <div
      v-else-if="flightError || routeError"
      class="text-center text-red-500 font-semibold"
    >
      {{ flightError || routeError }}
    </div>

    <!-- Add New Flight -->
    <AddFlightForm :routes="routes" @add-flight="addFlightHandler" />

    <!-- Flights List -->
    <FlightList
      :flights="flights"
      :routes="routes"
      @delete-flight="deleteFlight"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFlights } from "../../modules/useFlights";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import AddFlightForm from "../../components/flight/AddFlightForm.vue"; // Import the new component
import FlightList from "../../components/flight/FlightList.vue"; // Import FlightList component
import type { NewFlight } from "../../interfaces/interfaces";

const {
  flights,
  error: flightError,
  loading: flightLoading,
  fetchFlights,
  deleteFlight,
  addFlight,
} = useFlights();
const {
  routes,
  fetchRoutes,
  error: routeError,
  loading: routeLoading,
} = useFlightRoutes();

onMounted(() => {
  fetchRoutes();
  fetchFlights();
});

const addFlightHandler = async (newFlight: NewFlight) => {
  await addFlight(newFlight);
  await fetchFlights();
};
</script>
