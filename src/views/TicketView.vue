<template>
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Your Check-In Tickets</h1>

    <div v-if="loading" class="text-center">Loading your tickets...</div>
    <div v-if="tickets.length === 0" class="text-center">
      You have no tickets yet.
    </div>

    <div class="flex flex-wrap" v-if="tickets.length > 0">
      <div
        v-for="(ticket, index) in tickets"
        :key="ticket._id"
        class="mb-4 p-4 w-[45%] rounded-lg shadow"
      >
        <!-- Render ticketHtml as raw HTML -->
        <div v-html="ticket.ticketHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCheckIn } from "../modules/useCheckIn";
import { useUsers } from "../modules/auth/useUsers";

const { getTokenAndUserId } = useUsers();
const { fetchSavedTickets } = useCheckIn();

const tickets = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const userId = getTokenAndUserId().userId; // Get the logged-in user's ID
    const savedTickets = await fetchSavedTickets(userId); // Fetch saved tickets
    tickets.value = savedTickets; // Store the tickets
  } catch (error) {
    console.error("❌ Failed to fetch tickets:", error);
  } finally {
    loading.value = false; // End loading state
  }
});
</script>

<style scoped>
/* Add styles to match your theme or design system */
</style>
