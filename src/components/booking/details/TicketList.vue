<template>
  <div v-if="tickets?.length" class="mt-4">
    <h3 class="text-md font-medium mb-2">🧾 Tickets:</h3>
    <div
      v-for="ticket in tickets"
      :key="ticket.ticket_id"
      class="bg-gray-100 p-3 rounded-md mb-2 text-sm"
    >
      <p>👤 Name: {{ ticket.firstName }} {{ ticket.lastName }}</p>
      <p>🪑 Seat: {{ ticket.seatNumber }}</p>
      <p>🚹 Gender: {{ ticket.gender }}</p>
      <p>🎫 Price: €{{ ticket.ticketPrice.toFixed(2) }}</p>
      <p>✈️ Flight ID: {{ ticket.flight_id }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from "@/interfaces/interfaces";
defineProps<{ tickets: Ticket[] }>();
</script>
