<template>
  <div class="p-6 text-black max-w-4xl mx-auto">
    <h1 class="text-2xl text-white font-bold mb-6">👤 My Bookings</h1>

    <!-- Loading & Error -->
    <div v-if="userLoading" class="text-blue-500 mb-4">
      Loading your profile...
    </div>

    <div v-if="userError && bookingError" class="text-red-600 mb-4">
      {{ userError || bookingError }}
    </div>

    <UserDetails v-if="user" :user="user" />

    <!-- Tabs -->
    <div v-if="bookings.length" class="flex space-x-4 mb-6">
      <button
        @click="activeTab = 'upcoming'"
        :class="
          activeTab === 'upcoming'
            ? 'border-b-2 border-blue-600 text-gray-400 font-semibold'
            : 'text-white hover:text-gray-200'
        "
      >
        Upcoming ({{ upcomingBookings.length }})
      </button>
      <button
        @click="activeTab = 'past'"
        :class="
          activeTab === 'past'
            ? 'border-b-2 border-blue-600 text-gray-400 font-semibold'
            : 'text-white hover:text-gray-200'
        "
      >
        Past ({{ pastBookings.length }})
      </button>
    </div>
    <!-- Loading & Error -->
    <div v-if="bookingLoading" class="text-blue-500 mb-4">
      Loading your booking...
    </div>
    <!-- Booking Cards Grid -->
    <div
      v-if="filteredBookings.length"
      class="grid grid-cols-1 sm:grid-cols-2 gap-6"
    >
      <div
        v-for="booking in filteredBookings"
        :key="booking._id"
        class="bg-white shadow-md rounded-xl p-6 flex flex-col"
      >
        <!-- Header -->
        <BookingHeader
          :booking="booking"
          :showId="true"
          :showCancelButton="true"
          @cancel="cancel"
        />

        <!-- Booking Info -->
        <BookingInfo :booking="booking" :formatDate="formatDate" />

        <!-- Flight Details for first ticket -->
        <div v-if="flightLoading" class="text-blue-500 mb-4">
          Loading flight details...
        </div>
        <div v-if="flightError" class="text-red-600 mb-4">
          {{ flightError }}
        </div>
        <FlightDetails
          :ticket="booking.tickets[0]"
          :flight="flightFor(booking.tickets[0].flight_id)"
          :formatDate="formatDate"
        />

        <!-- Tickets List -->
        <TicketList :tickets="booking.tickets" />
      </div>
    </div>

    <!-- No items in selected tab -->
    <div
      v-if="!bookingLoading && bookings.length && filteredBookings.length === 0"
      class="text-white"
    >
      No {{ activeTab }} bookings.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useUsers } from "../modules/auth/useUsers";

import UserDetails from "@/components/user/UserDetails.vue";
import BookingHeader from "@/components/booking/details/BookingHeader.vue";
import BookingInfo from "@/components/booking/details/BookingInfo.vue";
import FlightDetails from "@/components/booking/details/FlightDetails.vue";
import TicketList from "@/components/booking/details/TicketList.vue";

import type { Flight } from "@/interfaces/interfaces";

const {
  bookings,
  loading: bookingLoading,
  error: bookingError,
  fetchUserBookings,
  cancelBooking,
} = useBookings();
const {
  fetchFlightById,
  loading: flightLoading,
  error: flightError,
} = useFlights();
const {
  user,
  fetchUserProfile,
  loading: userLoading,
  error: userError,
} = useUsers();

const flightsById = ref<Record<string, Flight>>({});
const activeTab = ref<"upcoming" | "past">("upcoming");

// Load user bookings and flights on mount
onMounted(async () => {
  await fetchUserProfile();
  await fetchUserBookings();
  await loadFlights();
});

async function loadFlights() {
  const ids = [
    ...new Set(
      bookings.value.flatMap((b) => b.tickets.map((t) => t.flight_id))
    ),
  ];
  for (const id of ids) {
    if (!flightsById.value[id]) {
      try {
        flightsById.value[id] = await fetchFlightById(id);
      } catch {
        // ignore
      }
    }
  }
}

// Split upcoming vs past based on first ticket departure date
const today = new Date();
const upcomingBookings = computed(() =>
  bookings.value.filter((b) => new Date(b.tickets[0].departureDate) >= today)
);
const pastBookings = computed(() =>
  bookings.value.filter((b) => new Date(b.tickets[0].departureDate) < today)
);

// Which to show
const filteredBookings = computed(() =>
  activeTab.value === "upcoming" ? upcomingBookings.value : pastBookings.value
);

// Helper to look up a flight
function flightFor(flightId: string): Flight | undefined {
  return flightsById.value[flightId];
}

// Cancel one of the user’s bookings
async function cancel(id: string) {
  if (confirm("Cancel this booking?")) {
    await cancelBooking(id);
  }
}

// Format ISO date → dd MMM yyyy
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
