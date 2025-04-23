<!-- components/DatePicker.vue -->
<template>
  <div>
    <label class="block text-blue-600 font-medium mb-2">
      Select Departure Date:
    </label>
    <vue3-datepicker
      v-model="internalValue"
      :disabledDates="disabledDates"
      format="yyyy-MM-dd"
      placeholder="Select Date"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Vue3Datepicker from "vue3-datepicker";

const props = defineProps<{
  modelValue: Date | undefined;
  disabledDates?: { predicate: (date: Date) => boolean };
}>();

const emit = defineEmits(["update:modelValue"]);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
