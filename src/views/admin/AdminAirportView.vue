<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-bold text-gray-800 text-center mb-4">
      ✈️ Airports List
    </h2>

    <!-- Search Airport -->
    <div class="flex items-center space-x-2">
      <input
        v-model="airportCode"
        placeholder="Enter IATA Code (e.g., JFK)"
        class="border text-black border-gray-300 p-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="fetchAndStoreAirport(airportCode)"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Fetch Airport
      </button>
    </div>

    <!-- Loading / Error Messages -->
    <p v-if="loading" class="text-blue-500 text-center mt-4">⏳ Loading...</p>
    <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>

    <!-- Display Fetched Airport -->
    <div
      v-if="airport"
      class="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg shadow-sm"
    >
      <h3 class="text-lg font-semibold text-blue-700">Fetched Airport</h3>
      <p class="text-gray-700 mt-2">
        <strong class="text-gray-900">📍 Name:</strong> {{ airport.name }}
        <br />
        <strong class="text-gray-900">✈️ Code:</strong>
        {{ airport.airportCode }} <br />
        <strong class="text-gray-900">🏙 City:</strong> {{ airport.cityName }}
        <br />
        <strong class="text-gray-900">🌍 Country:</strong>
        {{ airport.countryCode }}
      </p>
    </div>

    <!-- List of Airports -->
    <div v-if="airports.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">
        📜 Stored Airports
      </h3>
      <ul class="space-y-2">
        <li
          v-for="airport in airports"
          :key="airport._id"
          class="border p-3 rounded-lg bg-gray-50 shadow-sm flex justify-between items-center"
        >
          <div>
            <p class="text-gray-900 font-semibold">
              {{ airport.name }} ({{ airport.airportCode }})
            </p>
            <p class="text-gray-600 text-sm">
              {{ airport.cityName }}, {{ airport.countryCode }}
            </p>
          </div>
          <button
            class="bg-red-600 text-white p-2 rounded hover:bg-red-700"
            @click="deleteAirport(airport._id)"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAirports } from "../../modules/useAirports";

const {
  airports,
  airport,
  error,
  loading,
  fetchAirports,
  fetchAndStoreAirport,
  deleteAirport,
} = useAirports();
const airportCode = ref("");

onMounted(() => {
  fetchAirports();
});
</script>
