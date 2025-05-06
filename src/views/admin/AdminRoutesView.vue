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

    <RouteForm
      v-else
      :airports="airports"
      :durations="durations"
      @submit="addRouteHandler"
    />

    <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold text-green-400 mb-4">
        📋 Flight Routes
      </h2>

      <RouteItem
        v-for="route in routes"
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
import { onMounted, ref } from "vue";
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

const addRouteHandler = async (newRoute: NewFlightRoute) => {
  await addRoute(newRoute);
};

const updateRouteHandler = async ({
  id,
  data,
}: {
  id: string;
  data: Omit<flightRoute, "_id">;
}) => {
  await updateRoute(id, data);
};
</script>
