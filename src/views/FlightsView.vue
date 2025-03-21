<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-extrabold text-gray-800 text-center mb-6">
        Flights Information
      </h2>

      <div
        v-if="loading"
        class="text-center text-xl font-semibold text-blue-600"
      >
        Loading flights...
      </div>
      <div v-else-if="error" class="text-center text-red-500 text-xl">
        {{ error }}
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="flight in flights"
          :key="flight._id"
          class="bg-white p-6 rounded-xl shadow-lg border border-gray-300"
        >
          <div class="flex items-center justify-between border-b pb-2 mb-2">
            <p class="text-lg font-semibold text-gray-800">
              Flight {{ flight.flightNumber }}
            </p>
            <span
              class="bg-blue-100 text-blue-600 px-3 py-1 text-sm rounded-full"
              >On Time</span
            >
          </div>

          <div class="text-gray-600 space-y-1">
            <p>
              <strong>Departure:</strong>
              {{ flight.route.departureAirport_id }} -
              {{ flight.departureTime }}
            </p>
            <p>
              <strong>Arrival:</strong> {{ flight.route.arrivalAirport_id }} -
              {{ flight.arrivalTime }}
            </p>
            <p><strong>Duration:</strong> {{ flight.route.duration }}</p>
          </div>

          <div class="flex justify-between mt-4">
            <button
              class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Flight Details
            </button>
            <button
              class="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFlights } from "../modules/useFlights";

const { loading, error, flights, fetchFlights } = useFlights();

onMounted(() => {
  fetchFlights();
});
</script>

<style scoped></style>
