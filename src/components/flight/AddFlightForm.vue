<template>
  <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
    <h2 class="text-2xl font-semibold text-blue-400 mb-4">➕ Add Flight</h2>
    <form @submit.prevent="addFlightHandler">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          v-model="newFlight.flightNumber"
          type="text"
          placeholder="Flight Number"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        />

        <select
          v-model="newFlight.route._id"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        >
          <option value="" disabled>Select Route</option>
          <option v-for="route in routes" :key="route._id" :value="route._id">
            {{ getRouteName(route) }}
          </option>
        </select>

        <input
          v-model="newFlight.departureDay"
          type="text"
          placeholder="Departure Day (e.g., Monday)"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        />

        <input
          v-model="newFlight.departureTime"
          type="text"
          placeholder="Departure Time (e.g., 14:30)"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        />

        <div class="flex flex-col">
          <label for="aircraft_id" class="text-gray-400">Aircraft type</label>
          <input
            v-model="newFlight.aircraft_id"
            type="text"
            placeholder="Aircraft Type"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col">
          <label for="basePrice" class="text-gray-400">Base price</label>
          <input
            v-model="newFlight.basePrice"
            type="number"
            placeholder="Base Price"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />
        </div>

        <div class="flex flex-col">
          <label for="startDate" class="text-gray-400">Operating Period</label>
          <input
            v-model="newFlight.operatingPeriod.startDate"
            type="date"
            class="mb-2 p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />
          <input
            v-model="newFlight.operatingPeriod.endDate"
            type="date"
            class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            v-model="newFlight.isReturnFlightRequired"
            type="checkbox"
            class="text-white"
          />
          <span class="text-gray-400">Return Flight Required</span>
        </div>
      </div>

      <button
        type="submit"
        class="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
      >
        ✈️ Create Flight
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { defineModel, defineProps, defineEmits } from "vue";
import type { NewFlight } from "../../interfaces/interfaces";

const newFlight = defineModel<NewFlight>({ required: true });

// Props
const { routes } = defineProps<{
  routes: Array<any>;
}>();

const emit = defineEmits(["add-flight", "reset-flight"]);

const addFlightHandler = () => {
  if (!newFlight.value.route._id) {
    alert("Please select a valid route.");
    return;
  }

  emit("add-flight", newFlight.value);
  alert("Flight added successfully!");
  emit("reset-flight"); // ask parent to reset
};

// Helper function
const getRouteName = (route: any) =>
  `${route.departureAirport_id} → ${route.arrivalAirport_id}`;
</script>
