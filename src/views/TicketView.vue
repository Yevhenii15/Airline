<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-white">Your Check-In Tickets</h1>

    <div v-if="loading" class="text-center text-white">
      Loading your tickets...
    </div>
    <div
      v-else-if="filteredTickets.length === 0"
      class="text-center text-white"
    >
      You have no tickets yet.
    </div>

    <div class="flex flex-wrap gap-4" v-else>
      <TicketDisplay
        v-for="ticket in filteredTickets"
        :key="ticket._id"
        :ticket="ticket"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useCheckIn } from "../modules/useCheckIn";
import { useUsers } from "../modules/auth/useUsers";
import TicketDisplay from "../components/ticket/TicketDisplay.vue";

const { getTokenAndUserId } = useUsers();
const { fetchSavedTickets } = useCheckIn();

const tickets = ref<any[]>([]);
const loading = ref(true);

const filteredTickets = computed(() => {
  return tickets.value.filter((ticket) => ticket.isCheckedIn);
});

onMounted(async () => {
  try {
    const userId = getTokenAndUserId().userId;
    const savedTickets = await fetchSavedTickets(userId);
    tickets.value = savedTickets;
  } catch (error) {
    // console.error("❌ Failed to fetch tickets:", error);
  } finally {
    loading.value = false;
  }
});
</script>
