<template>
  <div class="grid gap-2 text-sm text-gray-200 mb-4 bg-zinc-800 p-4 rounded-xl">
    <p>
      📅 <span class="text-[#ff7f50] font-medium">Booking Date:</span>
      {{ formatDate(booking.bookingDate) }}
    </p>
    <p>
      💰 <span class="text-[#ff7f50] font-medium">Total Price:</span> €{{
        booking.totalPrice.toFixed(2)
      }}
    </p>
    <p>
      🎟️ <span class="text-[#ff7f50] font-medium">Tickets:</span>
      {{ booking.numberOfTickets }}
    </p>
    <p>
      📌 <span class="text-[#ff7f50] font-medium">Status:</span>
      <span
        :class="{
          'text-green-400': booking.bookingStatus === 'Confirmed',
          'text-yellow-400': booking.bookingStatus === 'Pending',
          'text-red-400': booking.bookingStatus === 'Cancelled',
        }"
        class="font-semibold"
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
