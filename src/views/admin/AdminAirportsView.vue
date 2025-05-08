<template>
  <div class="flex justify-between p-6 mb-4">
    <router-link
      to="/admin"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      🔙 Back to Admin
    </router-link>
    <router-link
      to="/admin_routes"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      Create Route ➡️
    </router-link>
  </div>
  <h1 class="text-3xl text-white mt-5 font-bold text-center mb-8">
    ✈️ Admin View - Airports
  </h1>
  <div class="max-w-2xl mx-auto p-6 bg-[#222222] shadow-lg rounded-lg">
    <!-- Search Airport -->
    <div class="flex items-center space-x-2">
      <input
        v-model="airportCode"
        placeholder="Enter IATA Code (e.g., JFK)"
        class="border border-gray-600 p-2 rounded-lg flex-grow bg-[#2b2b2b] text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500"
      />
      <button
        @click="fetchAndStoreAirport(airportCode)"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Fetch Airport
      </button>
    </div>

    <!-- Loading / Error Messages -->
    <p v-if="loading" class="text-blue-400 text-center mt-4">⏳ Loading...</p>
    <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>

    <!-- Display Fetched Airport -->
    <div
      v-if="airport"
      class="mt-6 p-4 border-l-4 border-blue-500 bg-[#2b2b2b] rounded-lg shadow"
    >
      <h3 class="text-lg font-semibold text-blue-300">Fetched Airport</h3>
      <p class="text-gray-300 mt-2">
        <strong class="text-white">📍 Name:</strong> {{ airport.name }}<br />
        <strong class="text-white">✈️ Code:</strong> {{ airport.airportCode
        }}<br />
        <strong class="text-white">🏙 City:</strong> {{ airport.cityName }}<br />
        <strong class="text-white">🌍 Country:</strong>
        {{ airport.countryCode }}
      </p>
    </div>

    <!-- List of Airports -->
    <div v-if="airports.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold text-blue-400 mb-2">
        📜 Stored Airports
      </h3>
      <ul class="space-y-2">
        <li
          v-for="airport in airports"
          :key="airport._id"
          class="border border-gray-600 p-3 rounded-lg bg-[#2b2b2b] shadow flex justify-between items-center"
        >
          <div>
            <p class="text-white font-semibold">
              {{ airport.name }} ({{ airport.airportCode }})
            </p>
            <p class="text-gray-400 text-sm">
              {{ airport.cityName }}, {{ airport.countryCode }}
            </p>
          </div>
          <button
            class="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
            @click="deleteAirport(airport._id)"
          >
            🗑 Delete
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
