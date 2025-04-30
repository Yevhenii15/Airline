<template>
  <div class="bg-[#181818] min-h-screen p-6 text-white">
    <h1 class="text-3xl font-bold text-center mb-8">
      ✈️ Admin View - Flight Routes
    </h1>
    <div
      v-if="loadingRoutes && loadingAirports"
      class="text-center text-blue-400 text-lg"
    >
      ⏳ Loading...
    </div>

    <div
      v-else-if="routesError || airportError"
      class="text-center text-red-500 font-semibold"
    >
      {{ routesError || airportError }}
    </div>

    <!-- Add new route section -->
    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-blue-400 mb-4">
        ➕ Add Flight Route
      </h2>
      <form @submit.prevent="addRouteHandler">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            v-model="newRoute.departureAirport_id"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Departure Airport</option>
            <option
              v-for="airport in airports"
              :key="airport._id"
              :value="airport.airportCode"
            >
              {{ airport.name }} ({{ airport.airportCode }})
            </option>
          </select>

          <select
            v-model="newRoute.arrivalAirport_id"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Arrival Airport</option>
            <option
              v-for="airport in airports"
              :key="airport._id"
              :value="airport.airportCode"
            >
              {{ airport.name }} ({{ airport.airportCode }})
            </option>
          </select>

          <select
            v-model="newRoute.duration"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Duration</option>
            <option v-for="time in durations" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
        <button
          type="submit"
          class="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          ✈️ Create Route
        </button>
      </form>
    </div>

    <!-- Flight Routes List -->
    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-green-400 mb-4">
        📋 Flight Routes
      </h2>
      <div
        v-for="route in routes"
        :key="route._id"
        class="mb-4 p-4 bg-[#2b2b2b] rounded-lg shadow"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            v-model="route.departureAirport_id"
            class="p-3 border border-gray-600 rounded bg-[#333333] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Departure Airport</option>
            <option
              v-for="airport in airports"
              :key="airport._id"
              :value="airport.airportCode"
            >
              {{ airport.name }} ({{ airport.airportCode }})
            </option>
          </select>

          <select
            v-model="route.arrivalAirport_id"
            class="p-3 border border-gray-600 rounded bg-[#333333] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Arrival Airport</option>
            <option
              v-for="airport in airports"
              :key="airport._id"
              :value="airport.airportCode"
            >
              {{ airport.name }} ({{ airport.airportCode }})
            </option>
          </select>

          <select
            v-model="route.duration"
            class="p-3 border border-gray-600 rounded bg-[#333333] text-white focus:ring focus:ring-blue-500"
          >
            <option value="" disabled>Select Duration</option>
            <option v-for="time in durations" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <p class="text-gray-400 text-sm">🆔 ID: {{ route._id }}</p>
          <div class="flex space-x-2">
            <button
              class="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
              @click="deleteRoute(route._id)"
            >
              🗑 Delete
            </button>
            <button
              class="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
              @click="updateRouteHandler(route)"
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import { useAirports } from "../../modules/useAirports";
import type { flightRoute } from "../../interfaces/interfaces";

const {
  routes,
  error: routesError,
  loading: loadingRoutes, // Rename to avoid conflicts
  fetchRoutes,
  deleteRoute,
  addRoute,
  updateRoute,
} = useFlightRoutes();

const {
  airports,
  fetchAirports,
  loading: loadingAirports,
  error: airportError,
} = useAirports(); // Add loadingAirports

onMounted(() => {
  fetchAirports();
  fetchRoutes();
});

const newRoute = ref({
  departureAirport_id: "",
  arrivalAirport_id: "",
  duration: "",
});

const addRouteHandler = async () => {
  await addRoute(newRoute.value);
  newRoute.value = {
    departureAirport_id: "",
    arrivalAirport_id: "",
    duration: "",
  };
};

const updateRouteHandler = async (route: flightRoute) => {
  const updatedRoute = {
    departureAirport_id: route.departureAirport_id,
    arrivalAirport_id: route.arrivalAirport_id,
    duration: route.duration,
  };
  await updateRoute(route._id, updatedRoute);
};
const durations = ref<string[]>([]);

for (let hour = 0; hour <= 10; hour++) {
  // Add the full hour times first (e.g., 01:00, 02:00)
  const formattedHour = hour.toString().padStart(2, "0");
  durations.value.push(`${formattedHour}:00`);

  // Then add the 15, 30, and 45 minute intervals
  for (let minute = 15; minute < 60; minute += 15) {
    const formattedMinute = minute.toString().padStart(2, "0");
    durations.value.push(`${formattedHour}:${formattedMinute}`);
  }
}

console.log(durations.value);
</script>

<style scoped>
input {
  background-color: #2b2b2b;
}

.lazy-css {
  color: #969696;
}

input[type="checkbox"] {
  accent-color: var(--input-field-color);
}
</style>
