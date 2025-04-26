<template>
  <div class="grid gap-2 text-sm text-gray-800 mb-4">
    <p>📅 Booking Date: {{ formatDate(booking.bookingDate) }}</p>
    <p>💰 Total Price: €{{ booking.totalPrice.toFixed(2) }}</p>
    <p>🎟️ Tickets: {{ booking.numberOfTickets }}</p>
    <p>
      📌 Status:
      <span
        :class="{
          'text-green-600': booking.bookingStatus === 'Confirmed',
          'text-yellow-600': booking.bookingStatus === 'Pending',
          'text-red-600': booking.bookingStatus === 'Cancelled',
        }"
      >
        {{ booking.bookingStatus }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from "@/interfaces/interfaces";
const props = defineProps<{
  booking: Booking;
  formatDate: (iso: string) => string;
}>();
</script>
