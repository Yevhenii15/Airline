<template>
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
            <option v-for="route in routes" :key="route._id" :value="route._id">
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
              ? formatDate(flight.operatingPeriod.startDate)
              : "N/A"
          }}
          to
          {{
            flight.operatingPeriod && flight.operatingPeriod.endDate
              ? formatDate(flight.operatingPeriod.endDate)
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
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFlights } from "../../modules/useFlights";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import type { Flight } from "../../interfaces/interfaces";
import { formatDate } from "../../modules/functions/dateFormater";
import { useAirports } from "../../modules/useAirports";

const { fetchAirports, airportNameMap } = useAirports();
const { flights, fetchFlights, deleteFlight, updateFlight } = useFlights();
const { routes, fetchRoutes } = useFlightRoutes();

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
  alert("Flight updated successfully!");

  // Refresh flights list after update
  await fetchFlights();
};

const getRouteName = (route: any) =>
  `${airportNameMap.value[route.departureAirport_id]} → ${
    airportNameMap.value[route.arrivalAirport_id]
  }`;

onMounted(() => {
  fetchRoutes();
  fetchFlights();
  fetchAirports();
});
</script>
