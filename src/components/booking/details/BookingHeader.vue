<template>
  <div class="flex justify-between items-start mb-4">
    <div>
      <h2 v-if="showId ?? true" class="text-lg font-semibold">
        🆔 Booking ID: {{ booking._id }}
      </h2>
      <p class="text-gray-300 text-sm">👤 User ID: {{ booking.user_id }}</p>
      <p class="text-gray-300 text-sm">
        📧 User Email: {{ booking.user_email }}
      </p>
    </div>

    <button
      v-if="showCancelButton ?? true"
      @click="$emit('cancel', booking._id)"
      class="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md shadow transition"
    >
      Cancel
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from "@/interfaces/interfaces";

defineProps<{
  booking: Booking;
  showId?: boolean;
  showCancelButton?: boolean;
}>();

defineEmits<{
  (e: "cancel", bookingId: any): void;
}>();
</script>
