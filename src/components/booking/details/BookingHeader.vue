<template>
  <div class="flex justify-between items-start mb-4">
    <div>
      <h2 class="text-l font-semibold">🆔 Booking ID: {{ booking._id }}</h2>
      <p class="text-gray-600 text-sm">👤 User ID: {{ booking.user_id }}</p>
      <p class="text-gray-600 text-sm">
        📧 User Email: {{ booking.user_email }}
      </p>
    </div>
    <button
      @click="$emit('cancel', booking._id)"
      class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
    >
      Cancel
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from "@/interfaces/interfaces";
defineProps<{ booking: Booking }>();
defineEmits<{
  (e: "cancel", bookingId: any): void;
}>();
</script>
