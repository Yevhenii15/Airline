<template>
  <div class="bg-[#181818] min-h-screen p-6 text-white">
    <h1 class="text-3xl font-bold text-center mb-8">✈️ Admin View - Flights</h1>

    <div v-if="loading" class="text-center text-blue-400 text-lg">
      ⏳ Loading...
    </div>
    <div v-else-if="error" class="text-center text-red-500 font-semibold">
      {{ error }}
    </div>

    <!-- Add New Flight -->
    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-blue-400 mb-4">➕ Add Flight</h2>
      <form @submit.prevent="addFlightHandler">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="newFlight.flightNumber"
            type="text"
            placeholder="Flight Number"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />

          <select
            v-model="newFlight.route._id"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Route</option>
            <option v-for="route in routes" :key="route._id" :value="route._id">
              {{ getRouteName(route) }}
            </option>
          </select>

          <input
            v-model="newFlight.departureTime"
            type="datetime-local"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />

          <input
            v-model="newFlight.arrivalTime"
            type="datetime-local"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />

          <input
            v-model="newFlight.aircraft_id"
            type="text"
            placeholder="Aircraft ID"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          class="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          ✈️ Create Flight
        </button>
      </form>
    </div>

    <!-- Flights List -->
    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-green-400 mb-4">📋 Flights</h2>

      <div
        v-for="flight in flights"
        :key="flight._id"
        class="mb-4 p-4 bg-[#2b2b2b] rounded-lg shadow"
      >
        <template v-if="editableFlight && editableFlight._id === flight._id">
          <!-- Edit Form -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              v-model="editableFlight.flightNumber"
              type="text"
              placeholder="Flight Number"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />

            <select
              v-model="editableFlight.route._id"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            >
              <option value="" disabled>Select Route</option>
              <option
                v-for="route in routes"
                :key="route._id"
                :value="route._id"
              >
                {{ getRouteName(route) }}
              </option>
            </select>

            <input
              v-model="editableFlight.departureTime"
              type="datetime-local"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />

            <input
              v-model="editableFlight.arrivalTime"
              type="datetime-local"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />

            <input
              v-model="editableFlight.aircraft_id"
              type="text"
              placeholder="Aircraft ID"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
          </div>

          <div class="mt-4 flex space-x-2">
            <button
              @click="saveUpdatedFlight"
              class="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
            >
              💾 Save
            </button>
            <button
              @click="editableFlight = null"
              class="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition"
            >
              ❌ Cancel
            </button>
          </div>
        </template>

        <template v-else>
          <!-- Display Mode -->
          <p class="text-lg font-semibold text-white">
            ✈️ {{ flight.flightNumber }} ({{ getRouteName(flight.route) }})
          </p>
          <p class="text-gray-400 text-sm">
            🕒 {{ formatDate(flight.departureTime) }} →
            {{ formatDate(flight.arrivalTime) }}
          </p>
          <p class="text-gray-400 text-sm">🆔 ID: {{ flight._id }}</p>

          <div class="mt-4 flex space-x-2">
            <button
              class="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
              @click="deleteFlight(flight._id)"
            >
              🗑 Delete
            </button>
            <button
              class="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
              @click="updateFlightHandler(flight)"
            >
              ✏️ Edit
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFlights } from "../../modules/useFlights";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import type { Flight, NewFlight } from "../../interfaces/interfaces";

const {
  flights,
  error,
  loading,
  fetchFlights,
  deleteFlight,
  addFlight,
  updateFlight,
} = useFlights();
const { routes, fetchRoutes } = useFlightRoutes();

onMounted(() => {
  fetchRoutes();
  fetchFlights();
});
// Function to get current date-time in "YYYY-MM-DDTHH:MM" format
const getCurrentDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};
const formatDateForInput = (date: Date) => {
  return date.toISOString().slice(0, 16); // Trims the milliseconds and 'Z'
};
const newFlight = ref<NewFlight>({
  flightNumber: "",
  departureTime: formatDateForInput(new Date()), // Set current time
  arrivalTime: formatDateForInput(new Date()), // Set current time
  status: "Scheduled",
  route: {
    // ✅ Store the full object
    _id: "",
    departureAirport_id: "",
    arrivalAirport_id: "",
    duration: "",
  },
  aircraft_id: "",
  totalSeats: 150,
  seatMap: [],
  seats: [],
});

const addFlightHandler = async () => {
  if (!newFlight.value.route._id) {
    console.error("Invalid route selected");
    return;
  }

  await addFlight(newFlight.value); // ✅ Sends the full route object

  // Reset form
  newFlight.value = {
    flightNumber: "",
    departureTime: getCurrentDateTime(),
    arrivalTime: getCurrentDateTime(),
    status: "Scheduled",
    route: {
      // Reset to an empty object
      _id: "",
      departureAirport_id: "",
      arrivalAirport_id: "",
      duration: "",
    },
    aircraft_id: "",
    totalSeats: 150,
    seatMap: [],
    seats: [],
  };
};
const editableFlight = ref<Flight | null>(null);

const updateFlightHandler = (flight: Flight) => {
  editableFlight.value = {
    ...flight,
    departureTime: formatDateForInput(new Date(flight.departureTime)), // Convert format
    arrivalTime: formatDateForInput(new Date(flight.arrivalTime)), // Convert format
  }; // Clone the flight object for editing
};
const saveUpdatedFlight = async () => {
  if (!editableFlight.value) return;

  await updateFlight(editableFlight.value._id, editableFlight.value);

  // Reset form after update
  editableFlight.value = null;

  // Refresh flights list
  await fetchFlights();
};

const getRouteName = (route: any) => {
  if (!route || !route._id) return "Unknown Route"; // ✅ Ensure valid route

  return `${route.departureAirport_id} → ${route.arrivalAirport_id}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
