<template>
  <div class="mb-4 p-4 bg-[#2b2b2b] rounded-lg shadow">
    <RouteForm
      v-model="route"
      :airports="airports"
      :durations="durations"
      @submit="onEdit"
    >
      <template #title>📝 Edit Flight Route</template>
      <template #buttonText>✏️ Save Changes</template>
    </RouteForm>
    <div class="mt-4 flex items-center justify-between">
      <p class="text-gray-400 text-sm">🆔 ID: {{ route._id }}</p>
      <div class="flex space-x-2">
        <button
          class="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
          @click="onDelete"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import RouteForm from "./RouteForm.vue";
import type { flightRoute, Airport } from "../../interfaces/interfaces";

const props = defineProps<{
  route: flightRoute;
  airports: Airport[];
  durations: string[];
}>();

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "edit", payload: { id: string; data: Omit<flightRoute, "_id"> }): void;
}>();

// Using two-way binding with v-model
const route = ref<flightRoute>({ ...props.route });

// Emit delete event
const onDelete = () => emit("delete", route.value._id);

// Emit edit event with updated data
const onEdit = (data: Omit<flightRoute, "_id">) =>
  emit("edit", { id: route.value._id, data });
</script>
