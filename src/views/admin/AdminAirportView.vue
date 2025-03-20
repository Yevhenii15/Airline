<script setup lang="ts">
import { onMounted } from "vue";
import { useAirports } from "../../modules//useAirports";

const { airports, error, loading, fetchAirports } = useAirports();
onMounted(() => {
  fetchAirports();
});
</script>

<template>
  <div>
    <h2>Airports List</h2>
    <p v-if="loading">Loading...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>
    <ul v-else>
      <li v-for="airport in airports" :key="airport._id">
        {{ airport.name }} ({{ airport.airportCode }}) - {{ airport.cityName }},
        {{ airport.countryCode }}
      </li>
    </ul>
  </div>
</template>
