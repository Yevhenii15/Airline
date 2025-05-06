<template>
  <div>
    <label class="block text-blue-600 font-medium mb-2">
      Select Departure Date:
    </label>
    <vue3-datepicker
      v-model="model"
      :disabledDates="disabledDates"
      format="yyyy-MM-dd"
      placeholder="Select Date"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    />
  </div>
</template>

<script setup lang="ts">
import Vue3Datepicker from "vue3-datepicker";

// Use defineModel instead of props + emit
const model = defineModel<Date | undefined>();

const props = defineProps<{
  disabledDates?: { predicate: (date: Date) => boolean };
}>();
</script>
