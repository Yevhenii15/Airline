<template>
  <div v-if="tickets?.length" class="mt-4">
    <h3 class="text-lg font-semibold text-[#ff7f50] mb-4">🧾 Tickets</h3>
    <div
      v-for="ticket in tickets"
      :key="ticket.ticket_id"
      class="bg-zinc-800 border border-[#ff7f50] p-4 rounded-xl shadow-inner text-gray-200 mb-3 space-y-1"
    >
      <p>
        <span class="text-[#ff7f50] font-medium">👤 Name:</span>
        {{ ticket.firstName }} {{ ticket.lastName }}
      </p>
      <p>
        <span class="text-[#ff7f50] font-medium">🪑 Seat:</span>
        {{ ticket.seatNumber }}
      </p>
      <p>
        <span class="text-[#ff7f50] font-medium">🚹 Gender:</span>
        {{ ticket.gender }}
      </p>
      <p>
        <span class="text-[#ff7f50] font-medium">🎫 Price:</span>
        €{{ ticket.ticketPrice.toFixed(2) }}
      </p>
      <p>
        <span class="text-[#ff7f50] font-medium">✈️ Flight ID:</span>
        {{ ticket.flight_id }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from "@/interfaces/interfaces";
defineProps<{ tickets: Ticket[] }>();
</script>
