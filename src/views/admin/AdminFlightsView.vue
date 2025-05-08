<template>
  <div class="p-6">
    <router-link
      to="/admin"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      🔙 Back to Admin
    </router-link>
  </div>
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

    <AddFlightForm
      v-model="newFlightData"
      :routes="routes"
      @add-flight="addFlightHandler"
      @reset-flight="resetNewFlight"
    />

    <!-- Flights List -->
    <FlightList
      :flights="flights"
      :routes="routes"
      @delete-flight="deleteFlight"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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

const newFlightData = ref<NewFlight>({
  flightNumber: "",
  departureDay: "",
  departureTime: "",
  status: "Scheduled",
  route: {
    _id: "",
    departureAirport_id: "",
    arrivalAirport_id: "",
    duration: "",
  },
  aircraft_id: "",
  totalSeats: 192,
  seatMap: [],
  seats: [],
  basePrice: 0,
  operatingPeriod: {
    startDate: "",
    endDate: "",
  },
  isReturnFlightRequired: false,
});
const resetNewFlight = () => {
  newFlightData.value = {
    flightNumber: "",
    departureDay: "",
    departureTime: "",
    status: "Scheduled",
    route: {
      _id: "",
      departureAirport_id: "",
      arrivalAirport_id: "",
      duration: "",
    },
    aircraft_id: "",
    totalSeats: 192,
    seatMap: [],
    seats: [],
    basePrice: 0,
    operatingPeriod: {
      startDate: "",
      endDate: "",
    },
    isReturnFlightRequired: false,
  };
};

onMounted(() => {
  fetchRoutes();
  fetchFlights();
});

const addFlightHandler = async (newFlight: NewFlight) => {
  await addFlight(newFlight);
  await fetchFlights();
};
</script>
