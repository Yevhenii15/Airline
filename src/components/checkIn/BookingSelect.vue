<template>
  <div>
    <label for="bookingSelect" class="block mb-2 font-medium">
      Select a booking to check in:
    </label>
    <select
      id="bookingSelect"
      :value="selectedBookingId"
      @input="updateSelectedBookingId"
      @change="selectBooking"
      class="border p-2 rounded w-full text-black"
    >
      <option disabled value="">Choose a booking</option>
      <option
        v-for="booking in enrichedBookings"
        :key="booking._id"
        :value="booking._id"
      >
        Booking ID: {{ booking._id }} - Flight Number:
        {{ booking.flightNumber }} - Date:
        {{ formatDate(booking.tickets[0].departureDate) }} - From:
        {{ booking.departureAirportId }} To: {{ booking.arrivalAirportId }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";
import { useFlights } from "../../modules/useFlights";
import type { Booking } from "../../interfaces/interfaces";
import { formatDate } from "../../modules/functions/dateFormater";

const props = defineProps<{
  availableBookings: Booking[];
  selectedBookingId: string;
}>();

const emit = defineEmits<{
  (event: "update:selectedBookingId", id: string): void;
  (event: "selectBooking"): void;
}>();

const { fetchFlightById } = useFlights();

const enrichedBookings = ref<
  (Booking & {
    flightNumber: string;
    departureDate: string;
    departureAirportId: string;
    arrivalAirportId: string;
  })[]
>([]);

const updateSelectedBookingId = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  emit("update:selectedBookingId", value);
};

const selectBooking = () => {
  emit("selectBooking");
};

onMounted(async () => {
  const results = await Promise.all(
    props.availableBookings.map(async (booking) => {
      const flightId = booking.tickets[0]?.flight_id;
      let flight = null;

      try {
        flight = await fetchFlightById(flightId);
      } catch (e) {
        console.error("Failed to fetch flight:", flightId, e);
      }

      // Handle the case where flight is null
      if (!flight) {
        return {
          ...booking,
          flightNumber: "Unknown",
          departureDate: "Unknown",
          departureAirportId: "Unknown",
          arrivalAirportId: "Unknown",
        };
      }

      return {
        ...booking,
        flightNumber: flight.flightNumber,
        departureDate: flight.operatingPeriod.startDate, // or booking.tickets[0].departureDate if used
        departureAirportId: flight.route.departureAirport_id,
        arrivalAirportId: flight.route.arrivalAirport_id,
      };
    })
  );

  enrichedBookings.value = results;
});
</script>
