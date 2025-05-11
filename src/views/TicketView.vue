<template>
  <h1 class="p-4 max-w-4xl text-center mt-4 mx-auto text-2xl font-bold">
    Your Tickets
  </h1>

  <div class="p-4 max-w-4xl mx-auto flex flex-wrap">
    <div v-if="tickets.length === 0">No tickets available.</div>

    <div
      v-for="(ticket, index) in tickets"
      :key="ticket.ticketId"
      class="mb-6 p-4 w-[50%] rounded-lg shadow"
    >
      <div class="" v-html="ticket.ticketHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Ticket {
  ticketId: string;
  ticketHtml: string;
  passengerName: string;
}

const tickets = ref<Ticket[]>([]);

const fetchTickets = () => {
  const userId = localStorage.getItem("userId");
  const savedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  tickets.value = savedTickets.filter(
    (ticket: any) => ticket.userId === userId
  );
};

onMounted(() => {
  fetchTickets();
});
</script>
