<template>
  <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
    <h2 class="text-2xl font-semibold text-green-400 mb-4">📋 Flights</h2>

    <div
      v-for="flight in sortedFlights"
      :key="flight._id"
      class="mb-4 p-4 bg-[#2b2b2b] rounded-lg shadow"
    >
      <template v-if="editableFlight && editableFlight._id === flight._id">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="editableFlight.flightNumber"
            placeholder="Flight Number"
            class="input"
          />
          <select v-model="editableFlight.route._id" class="input">
            <option value="" disabled>Select Route</option>
            <option v-for="route in routes" :key="route._id" :value="route._id">
              {{ getRouteName(route) }}
            </option>
          </select>
          <input
            v-model="editableFlight.departureDay"
            placeholder="Departure Day"
            class="input"
          />
          <input
            v-model="editableFlight.departureTime"
            placeholder="Departure Time"
            class="input"
          />
          <input
            v-model="editableFlight.aircraft_id"
            placeholder="Aircraft ID"
            class="input"
          />
          <input
            v-model="editableFlight.basePrice"
            type="number"
            placeholder="Base Price"
            class="input"
          />
          <div class="flex flex-col">
            <label for="startDate" class="text-gray-400"
              >Operating Period</label
            >
            <input
              v-model="editableFlight.operatingPeriod.startDate"
              type="date"
              class="input"
            />
            <input
              v-model="editableFlight.operatingPeriod.endDate"
              type="date"
              class="input"
            />
          </div>
        </div>

        <div class="mt-4 flex space-x-2">
          <button @click="saveFlight" class="btn bg-blue-600 hover:bg-blue-700">
            💾 Save
          </button>
          <button
            @click="editableFlight = null"
            class="btn bg-gray-600 hover:bg-gray-700"
          >
            ❌ Cancel
          </button>
        </div>
      </template>

      <template v-else>
        <p class="text-lg font-semibold text-white">
          ✈️ {{ flight.flightNumber }} ({{ getRouteName(flight.route) }})
        </p>
        <p class="font-semibold text-sm">
          {{ flight.status === "Scheduled" ? "✅ Scheduled" : "❌ Cancelled" }}
        </p>
        <p class="text-gray-400 text-sm">📅 {{ flight.departureDay }}</p>
        <p class="text-gray-400 text-sm">
          🕒 {{ flight.departureTime }} → {{ flight.arrivalTime }}
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
            flight.operatingPeriod
              ? formatDate(flight.operatingPeriod.startDate)
              : "N/A"
          }}
          to
          {{
            flight.operatingPeriod
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
            v-if="flight.status !== 'Cancelled'"
            @click="$emit('delete-flight', flight._id)"
            class="btn bg-red-600 hover:bg-red-700"
          >
            🗑 Delete
          </button>
          <button
            v-if="flight.status !== 'Cancelled'"
            @click="editFlight(flight)"
            class="btn bg-green-600 hover:bg-green-700"
          >
            ✏️ Edit
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Flight, flightRoute } from "../../interfaces/interfaces";
import { formatDate } from "../../modules/functions/dateFormater";

const sortedFlights = computed(() => {
  return [...props.flights].reverse();
});

const props = defineProps<{
  flights: Flight[];
  routes: flightRoute[];
  airportNameMap: Record<string, string>;
}>();

const emit = defineEmits(["delete-flight", "update-flight"]);

const editableFlight = ref<Flight | null>(null);

const editFlight = (flight: Flight) => {
  editableFlight.value = {
    ...flight,
    departureTime: flight.departureTime,
    operatingPeriod: {
      startDate: flight.operatingPeriod.startDate.slice(0, 10),
      endDate: flight.operatingPeriod.endDate.slice(0, 10),
    },
  };
};

const saveFlight = () => {
  if (editableFlight.value) {
    emit("update-flight", editableFlight.value);
    editableFlight.value = null;
  }
};

const getRouteName = (route: flightRoute | null | undefined) => {
  if (
    !route ||
    !props.airportNameMap[route.departureAirport_id] ||
    !props.airportNameMap[route.arrivalAirport_id]
  ) {
    return "Unknown Route";
  }
  return `${props.airportNameMap[route.departureAirport_id]} → ${
    props.airportNameMap[route.arrivalAirport_id]
  }`;
};
</script>

<style scoped>
.input {
  @apply p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500;
}
.btn {
  @apply text-white p-2 rounded-lg transition;
}
</style>
