<template>
  <section
    class="w-full bg-gradient-to-br from-black via-zinc-900 to-black bg-opacity-80 rounded-3xl shadow-2xl border border-[#ff7f50] p-10 text-white mt-8 max-w-6xl mx-auto space-y-8"
  >
    <!-- Title -->
    <h1
      class="text-5xl font-extrabold text-center tracking-wide text-[#ff7f50] mb-6"
    >
      👤 My Profile
    </h1>

    <!-- Loading & Error -->
    <div
      v-if="userLoading"
      class="text-center text-orange-300 text-xl font-semibold"
    >
      🔄 Loading your profile...
    </div>
    <div
      v-if="userError && bookingError"
      class="text-center text-red-400 text-xl font-semibold"
    >
      ❗ {{ userError || bookingError }}
    </div>

    <!-- User Info -->
    <UserDetails v-if="user" v-model="user" />

    <!-- Tabs -->
    <div v-if="bookings.length" class="flex justify-center space-x-8 mb-6">
      <button
        @click="activeTab = 'upcoming'"
        :class="[
          'px-4 py-2 rounded-full font-semibold transition duration-200',
          activeTab === 'upcoming'
            ? 'bg-[#ff7f50] text-black shadow-lg'
            : 'text-white hover:text-orange-300',
        ]"
      >
        Upcoming ({{ upcomingBookings.length }})
      </button>
      <button
        @click="activeTab = 'past'"
        :class="[
          'px-4 py-2 rounded-full font-semibold transition duration-200',
          activeTab === 'past'
            ? 'bg-[#ff7f50] text-black shadow-lg'
            : 'text-white hover:text-orange-300',
        ]"
      >
        Past ({{ pastBookings.length }})
      </button>
    </div>

    <!-- Booking Loading -->
    <div
      v-if="bookingLoading"
      class="text-center text-orange-300 text-xl font-semibold"
    >
      🔄 Loading your bookings...
    </div>

    <!-- Booking Cards -->
    <div
      v-if="filteredBookings.length"
      class="grid grid-cols-1 sm:grid-cols-2 gap-8"
    >
      <div
        v-for="booking in filteredBookings"
        :key="booking._id"
        class="bg-zinc-800 p-6 rounded-2xl shadow-inner flex flex-col space-y-4 border border-zinc-700"
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

        <!-- Flight Details -->
        <div v-if="flightLoading" class="text-orange-300">
          🔄 Loading flight details...
        </div>
        <div v-if="flightError" class="text-red-400">❗ {{ flightError }}</div>
        <FlightDetails
          v-else
          :ticket="booking.tickets[0]"
          :flight="flightFor(booking.tickets[0].flight_id)"
          :formatDate="formatDate"
        />

        <!-- Tickets List -->
        <TicketList :tickets="booking.tickets" />
      </div>
    </div>

    <!-- No Bookings in Selected Tab -->
    <div
      v-if="!bookingLoading && bookings.length && filteredBookings.length === 0"
      class="text-center text-gray-300 text-lg"
    >
      No {{ activeTab }} bookings.
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useUsers } from "../modules/auth/useUsers";
import { formatDate } from "../modules/functions/dateFormater";

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

const flightsById = ref<Record<string, Flight | null>>({});
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

function flightFor(flightId: string): Flight | undefined {
  return flightsById.value[flightId] ?? undefined; // Return undefined if the flight is not found
}

// Cancel one of the user’s bookings
async function cancel(id: string) {
  if (confirm("Cancel this booking?")) {
    await cancelBooking(id);
  }
}
</script>
