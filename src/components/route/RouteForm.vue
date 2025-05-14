<template>
  <div class="my-8 p-6 bg-[#222222] rounded-lg shadow-lg">
    <h2 class="text-2xl font-semibold text-blue-400 mb-4">
      <slot name="title">➕ Add Flight Route</slot>
    </h2>
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          v-model="form.departureAirport_id"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        >
          <option value="" disabled>Select Departure Airport</option>
          <option
            v-for="airport in airports"
            :key="airport._id"
            :value="airport.airportCode"
          >
            {{ airport.name }} ({{ airport.airportCode }})
          </option>
        </select>

        <select
          v-model="form.arrivalAirport_id"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        >
          <option value="" disabled>Select Arrival Airport</option>
          <option
            v-for="airport in airports"
            :key="airport._id"
            :value="airport.airportCode"
          >
            {{ airport.name }} ({{ airport.airportCode }})
          </option>
        </select>

        <select
          v-model="form.duration"
          class="p-3 border border-gray-600 rounded bg-[#2b2b2b] text-white focus:ring focus:ring-blue-500"
        >
          <option value="" disabled>Select Duration</option>
          <option v-for="time in durations" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </div>
      <button
        type="submit"
        class="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
      >
        <slot name="buttonText">✈️ Create Route</slot>
      </button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import type { NewFlightRoute, Airport } from "../../interfaces/interfaces";

const props = defineProps<{
  airports: Airport[];
  durations: string[];
  modelValue: NewFlightRoute;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: NewFlightRoute): void;
  (e: "submit", payload: NewFlightRoute): void;
}>();

const form = ref<NewFlightRoute>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    form.value = { ...newVal };
  }
);

const onSubmit = () => {
  emit("submit", { ...form.value });
  emit("update:modelValue", { ...form.value });

  form.value = {
    departureAirport_id: "",
    arrivalAirport_id: "",
    duration: "",
  };
};
</script>
