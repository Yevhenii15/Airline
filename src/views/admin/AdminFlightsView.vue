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
            v-model="newFlight.departureDay"
            type="text"
            placeholder="Departure Day (e.g., Monday)"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />

          <input
            v-model="newFlight.departureTime"
            type="text"
            placeholder="Departure Time (e.g., 14:30)"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />

          <div class="flex flex-col">
            <label for="startDate" class="text-gray-400">Aircraft type</label>
            <input
              v-model="newFlight.aircraft_id"
              type="text"
              placeholder="Aircraft Type"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
          </div>
          <div class="flex flex-col">
            <label for="startDate" class="text-gray-400">Base price</label>
            <input
              v-model="newFlight.basePrice"
              type="number"
              placeholder="Base Price"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
          </div>

          <!-- Add Operating Period -->
          <div class="flex flex-col">
            <label for="startDate" class="text-gray-400"
              >Operating Period</label
            >
            <input
              v-model="newFlight.operatingPeriod.startDate"
              type="date"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
            <input
              v-model="newFlight.operatingPeriod.endDate"
              type="date"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
          </div>

          <!-- Return Flight Option -->
          <div class="flex items-center space-x-2">
            <input
              v-model="newFlight.isReturnFlightRequired"
              type="checkbox"
              class="text-white"
            />
            <span class="text-gray-400">Return Flight Required</span>
          </div>
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
              v-model="editableFlight.departureDay"
              type="text"
              placeholder="Departure Day (e.g., Monday)"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
            <input
              v-model="editableFlight.departureTime"
              type="text"
              placeholder="Departure Time (e.g., 14:30)"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />

            <input
              v-model="editableFlight.aircraft_id"
              type="text"
              placeholder="Aircraft ID"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />
            <input
              v-model="editableFlight.basePrice"
              type="number"
              placeholder="Base Price"
              class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
            />

            <!-- Operating Period -->
            <div class="flex flex-col">
              <label for="startDate" class="text-gray-400"
                >Operating Period</label
              >
              <input
                v-model="editableFlight.operatingPeriod.startDate"
                type="date"
                class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
              />
              <input
                v-model="editableFlight.operatingPeriod.endDate"
                type="date"
                class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
              />
            </div>
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

          <p class="text-gray-400 text-sm">📅 {{ flight.departureDay }}</p>
          <p class="text-gray-400 text-sm">
            🕒 {{ flight.departureTime }} →
            {{ flight.arrivalTime }}
          </p>
          <p class="text-gray-400 text-sm">🆔 ID: {{ flight._id }}</p>
          <p class="text-gray-400 text-sm">
            🛩️ Aircraft Type: {{ flight.aircraft_id }}
          </p>
          <p class="text-gray-400 text-sm">
            💰 Base Price: {{ flight.basePrice }}
          </p>
          <p class="text-gray-400 text-sm">
            📅 Operating Period:
            {{
              flight.operatingPeriod && flight.operatingPeriod.startDate
                ? formatDateOnly(flight.operatingPeriod.startDate)
                : "N/A"
            }}
            to
            {{
              flight.operatingPeriod && flight.operatingPeriod.endDate
                ? formatDateOnly(flight.operatingPeriod.endDate)
                : "N/A"
            }}
          </p>

          <p class="text-gray-400 text-sm">
            🔄 Return Flight Required:
            {{ flight.isReturnFlightRequired ? "Yes" : "No" }}
          </p>

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

onMounted(() => {
  fetchRoutes();
  fetchFlights();
});

const newFlight = ref<NewFlight>({
  flightNumber: "",
  departureDay: "",
  departureTime: "", // Use local time
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

const addFlightHandler = async () => {
  if (!newFlight.value.route._id) {
    console.error("Invalid route selected");
    return;
  }

  await addFlight(newFlight.value); // Sends the full route object

  // Reset form
  newFlight.value = {
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

const editableFlight = ref<Flight | null>(null);

const updateFlightHandler = (flight: Flight) => {
  editableFlight.value = {
    ...flight,
    departureTime: flight.departureTime, // Keep time as a string
    operatingPeriod: {
      startDate: flight.operatingPeriod.startDate.slice(0, 10), // Extract YYYY-MM-DD format
      endDate: flight.operatingPeriod.endDate.slice(0, 10),
    },
  };
};

const saveUpdatedFlight = async () => {
  if (!editableFlight.value) return;

  await updateFlight(editableFlight.value._id, editableFlight.value);

  // Reset form after update
  editableFlight.value = null;

  // Refresh flights list
  await fetchFlights();
};

const cancelEdit = () => {
  editableFlight.value = null; // Reset editable flight on cancel
};

const getRouteName = (route: any) => {
  if (!route || !route._id) return "Unknown Route";
  return `${route.departureAirport_id} → ${route.arrivalAirport_id}`;
};
const formatDateOnly = (dateString: string) => {
  if (!dateString) return "";
  return dateString.split("T")[0]; // Extract YYYY-MM-DD
};
</script>
