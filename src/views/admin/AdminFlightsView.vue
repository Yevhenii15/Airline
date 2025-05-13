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

    <FlightList
      :flights="flights"
      :routes="routes"
      :airport-name-map="airportNameMap"
      @delete-flight="deleteFlight"
      @update-flight="handleFlightUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFlights } from "../../modules/useFlights";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import { useAirports } from "../../modules/useAirports";
import AddFlightForm from "../../components/flight/AddFlightForm.vue";
import FlightList from "../../components/flight/FlightList.vue";
import type { NewFlight, Flight } from "../../interfaces/interfaces";

const {
  flights,
  error: flightError,
  loading: flightLoading,
  fetchFlights,
  deleteFlight,
  addFlight,
  updateFlight,
} = useFlights();

const {
  routes,
  fetchRoutes,
  error: routeError,
  loading: routeLoading,
} = useFlightRoutes();

const { fetchAirports, airportNameMap } = useAirports();

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
  operatingPeriod: { startDate: "", endDate: "" },
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
    operatingPeriod: { startDate: "", endDate: "" },
    isReturnFlightRequired: false,
  };
};

const addFlightHandler = async (newFlight: NewFlight) => {
  await addFlight(newFlight);
  await fetchFlights();
};

const handleFlightUpdate = async (updatedFlight: Flight) => {
  await updateFlight(updatedFlight._id, updatedFlight);
  await fetchFlights();
};

onMounted(() => {
  fetchRoutes();
  fetchFlights();
  fetchAirports();
});
</script>
