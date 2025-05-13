<template>
  <div class="flex justify-between p-6 mb-4">
    <router-link
      to="/admin"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      🔙 Back to Admin
    </router-link>
    <router-link
      to="/admin_flights"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      Create Flight ➡️
    </router-link>
  </div>
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

    <RouteForm
      v-else
      v-model="newRouteData"
      :airports="airports"
      :durations="durations"
      @submit="addRouteHandler"
    />

    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-green-400 mb-4">
        📋 Flight Routes
      </h2>

      <RouteItem
        v-for="route in sortedRoutes"
        :key="route._id"
        :route="route"
        :airports="airports"
        :durations="durations"
        @delete="deleteRoute"
        @edit="updateRouteHandler"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import { useAirports } from "../../modules/useAirports";
import type {
  flightRoute,
  NewFlightRoute,
  Airport,
} from "../../interfaces/interfaces";

import RouteForm from "../../components/route/RouteForm.vue";
import RouteItem from "../../components/route/RouteItem.vue";

const {
  routes,
  error: routesError,
  loading: loadingRoutes,
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
} = useAirports();

const sortedRoutes = computed(() => {
  return [...routes.value].reverse(); // assuming routes is a ref
});

onMounted(() => {
  fetchAirports();
  fetchRoutes();
});

const durations = ref<string[]>([]);
for (let hour = 0; hour <= 10; hour++) {
  const formattedHour = hour.toString().padStart(2, "0");
  durations.value.push(`${formattedHour}:00`);
  for (let minute = 15; minute < 60; minute += 15) {
    durations.value.push(
      `${formattedHour}:${minute.toString().padStart(2, "0")}`
    );
  }
}

const newRouteData = ref<NewFlightRoute>({
  departureAirport_id: "",
  arrivalAirport_id: "",
  duration: "",
});

const addRouteHandler = async (newRoute: NewFlightRoute) => {
  await addRoute(newRoute);
  alert("Route added successfully!");

  // Reset the newRouteData in the parent to clear the form
  newRouteData.value = {
    departureAirport_id: "",
    arrivalAirport_id: "",
    duration: "",
  };
};

const updateRouteHandler = async ({
  id,
  data,
}: {
  id: string;
  data: Omit<flightRoute, "_id">;
}) => {
  await updateRoute(id, data);
  alert("Route updated successfully!");
};
</script>
