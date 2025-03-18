<template>
  <div class="bg-[#181818] min-h-screen lazy-css">
    <h1 class="text-3xl font-bold mb-8">Admin View - Flight Routes</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <!-- Add new route section -->
    <div class="my-8 p-2 w-full">
      <h2 class="text-2xl font-semibold mb-4">Add Flight Route</h2>
      <form @submit.prevent="addRouteHandler">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="newRoute.departureAirport_id"
            type="text"
            placeholder="Departure Airport ID"
            class="p-2 border rounded"
          />
          <input
            v-model="newRoute.arrivalAirport_id"
            type="text"
            placeholder="Arrival Airport ID"
            class="p-2 border rounded"
          />
          <input
            v-model="newRoute.duration"
            type="text"
            placeholder="Duration (hh:mm)"
            class="p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          class="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Create Route
        </button>
      </form>
    </div>

    <!-- Edit existing routes -->
    <div class="my-8 p-2 w-full">
      <h2 class="text-2xl font-semibold mb-4">Flight Routes</h2>
      <div
        v-for="route in routes"
        :key="route.route_id"
        class="mb-4 p-4 border rounded bg-[#181818]"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            v-model="route.departureAirport_id"
            type="text"
            placeholder="Departure Airport ID"
            class="p-2 border rounded"
          />
          <input
            v-model="route.arrivalAirport_id"
            type="text"
            placeholder="Arrival Airport ID"
            class="p-2 border rounded"
          />
          <input
            v-model="route.duration"
            type="text"
            placeholder="Duration (hh:mm)"
            class="p-2 border rounded"
          />
        </div>
        <div class="mt-4 flex space-x-2">
          <p>ID: {{ route.route_id }}</p>
          <button
            class="bg-red-600 text-white p-2 rounded hover:bg-red-700"
            @click="deleteRoute(route.route_id)"
          >
            Delete
          </button>
          <button
            class="bg-green-600 text-white p-2 rounded hover:bg-green-700"
            @click="updateRouteHandler(route)"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFlightRoutes } from "../../modules/useFlightRoutes";
import type { flightRoute } from "../../interfaces/interfaces";

const {
  routes,
  error,
  loading,
  fetchRoutes,
  deleteRoute,
  addRoute,
  updateRoute,
} = useFlightRoutes();

onMounted(() => {
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
  await updateRoute(route.route_id, updatedRoute);
};
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
