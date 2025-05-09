<template>
  <section
    class="w-full max-w-7xl bg-gradient-to-br from-black via-zinc-900 to-black bg-opacity-80 rounded-3xl shadow-2xl border border-[#ff7f50] p-10 text-white mx-auto mt-12"
  >
    <h2
      class="text-4xl font-extrabold text-center mb-10 text-[#ff7f50] tracking-wide"
    >
      Destinations Overview
    </h2>

    <div
      v-if="loading"
      class="text-center text-orange-300 text-xl font-semibold"
    >
      🔄 Loading destinations...
    </div>
    <div
      v-else-if="error"
      class="text-center text-red-400 text-xl font-semibold"
    >
      ❗ {{ error }}
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="flight in flights"
        :key="flight._id"
        class="bg-zinc-800 p-6 rounded-xl shadow-inner border border-[#ff7f50] flex flex-col justify-between"
      >
        <div class="flex flex-col justify-between h-full">
          <!-- Flight Info Section -->
          <div
            class="flex items-center justify-between border-b border-[#ff7f50] pb-2 mb-3"
          >
            <p class="text-lg font-bold text-white">
              ✈️
              {{ flight.flightNumber }}
            </p>
          </div>

          <!-- Flight Details -->
          <div class="space-y-2 text-gray-300 text-sm">
            <p>
              <strong class="text-white">From:</strong>
              {{
                airportNameMap[flight.route.departureAirport_id] ||
                flight.route.departureAirport_id
              }}
            </p>
            <p>
              <strong class="text-white">To:</strong>
              {{
                airportNameMap[flight.route.arrivalAirport_id] ||
                flight.route.arrivalAirport_id
              }}
            </p>
            <p>
              <strong class="text-white">Departure Date:</strong>
              {{ flight.departureDay }}
            </p>
            <p>
              <strong class="text-white">Departure Time:</strong>
              {{ flight.departureTime }}
            </p>
            <p>
              <strong class="text-white">Arrival Time:</strong>
              {{ flight.arrivalTime }}
            </p>
            <p>
              <strong class="text-white">Duration:</strong>
              {{ flight.route.duration }}
            </p>
            <p>
              <strong class="text-white">Operating Period:</strong>
              {{ formatDate(flight.operatingPeriod.startDate) }} -
              {{ formatDate(flight.operatingPeriod.endDate) }}
            </p>
            <p>
              <strong class="text-white">Base Price:</strong> ${{
                flight.basePrice.toFixed(2)
              }}
            </p>
          </div>

          <!-- Action Button -->
          <button
            class="bg-[#ff7f50] text-white mt-6 py-2 rounded-lg text-sm font-medium hover:bg-[#e76e3c]"
            @click="$emit('select-flight', flight)"
          >
            Book Flight
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import type { Flight } from "../../interfaces/interfaces";
import { useAirports } from "../../modules/useAirports";
import { formatDate } from "../../modules/functions/dateFormater";

const { airportNameMap, fetchAirports } = useAirports();

onMounted(() => {
  fetchAirports();
});

defineProps<{
  flights: Flight[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: "select-flight", flight: Flight): void;
}>();
</script>
