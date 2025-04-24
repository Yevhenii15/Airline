<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">📋 Admin – All Bookings</h1>

    <div v-if="loading" class="text-blue-500">Loading bookings...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div
      v-for="booking in bookings"
      :key="booking._id"
      class="bg-white text-black shadow-lg rounded-2xl p-5 mb-6"
    >
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-xl font-semibold">
            🆔 Booking ID: {{ booking._id }}
          </h2>
          <p class="text-gray-600 text-sm">👤 User ID: {{ booking.user_id }}</p>
        </div>
        <button
          @click="handleCancel(booking._id!)"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md"
        >
          Cancel
        </button>
      </div>

      <div class="grid gap-2 text-sm text-gray-800">
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

      <div v-if="booking.tickets?.length" class="mt-4">
        <h3 class="text-md font-medium mb-2">🧾 Tickets:</h3>
        <div
          v-for="ticket in booking.tickets"
          :key="ticket.ticket_id"
          class="bg-gray-100 p-3 rounded-md mb-2"
        >
          <p>👤 Name: {{ ticket.firstName }} {{ ticket.lastName }}</p>
          <p>🪑 Seat: {{ ticket.seatNumber }}</p>
          <p>🚹 Gender: {{ ticket.gender }}</p>
          <p>🎫 Price: €{{ ticket.ticketPrice }}</p>
          <p>✈️ Flight ID: {{ ticket.flight_id }}</p>
          <p>📆 Departure: {{ formatDate(ticket.departureDate) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBookings } from "../../modules/useBookings";

const { bookings, error, loading, fetchAllBookings, cancelBooking } =
  useBookings();

onMounted(() => {
  fetchAllBookings();
});

const handleCancel = async (id: string) => {
  if (confirm("Are you sure you want to cancel this booking?")) {
    await cancelBooking(id);
  }
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
</script>
