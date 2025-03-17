<template>
  <div class="">
    <h2 class="text-2xl font-bold mb-4">Flights List</h2>
    <div v-if="loading" class="text-center">Loading...</div>                                           <!-- Loading wait screen with v-if -->

    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>                                        <!-- Error message with v-else-if -->

    <div v-else class="flex flex-wrap -mx-2">                                                  <!-- Loop through the flights -->
      <div v-for="flight in flights" :key="flight.flight_id" class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2" >                              <!-- Product card with v-for -->
        <div class="bg-white text-black p-4 rounded-lg shadow-md">
          <p>{{ flight.flightNumber }}</p>
          <p> {{ flight.departureTime }}</p>
          <p> {{ flight.arrivalTime }}</p>
          <p> {{ flight.route.arrivalAirport_id }}</p>
          <p> {{ flight.route.departureAirport_id }}</p>
          <p> {{ flight.route.duration }}</p>

          
          <div class="flex justify-between mt-4">
            <button class="bg-blue-500 text-white px-1 py-2 rounded hover:bg-blue-600">Flight Details</button>
            <button class="bg-green-500 text-white px-1 py-2 rounded hover:bg-green-600">Add to Cart</button> <!-- Add to cart button -->
          </div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useFlights } from '../modules/useFlights'; // Import useflights module

  const { loading, error, flights, fetchFlights} = useFlights(); 

  onMounted(() => {
    fetchFlights();
  });

  console.log('API URL:', import.meta.env.VITE_API_URL);

</script>

<style scoped>
</style>
