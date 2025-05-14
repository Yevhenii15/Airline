<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-bold text-[#ff7f50] mb-4">Booked Seats Viewer</h1>

    <div v-if="flightLoading" class="text-gray-500">Loading flights...</div>
    <div v-else-if="flightError" class="text-red-500">
      Error loading flights: {{ flightError }}
    </div>
    <FlightSelect
      v-model:departureAirport="departureAirport"
      v-model:arrivalAirport="arrivalAirport"
      v-model:selectedFlight="selectedFlight"
    />

    <div class="mt-6">
      <DatePicker
        v-if="selectedFlight"
        v-model="selectedDate"
        :disabledDates="disabledDates"
      />
    </div>

    <button
      class="mt-6 bg-[#ff7f50] hover:bg-[#ff956d] text-white font-bold py-2 px-4 rounded w-full"
      :disabled="!selectedFlight || !selectedDate"
      @click="loadSelectedSeats"
    >
      Load Booked Seats
    </button>

    <div v-if="selectedFlight && selectedDate && loaded" class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Seat Map</h2>

      <SeatMap
        :seat-map="availableSeats"
        :selected-seats="[]"
        :highlight-color="'red'"
        :selectable="false"
      />
    </div>

    <div v-else-if="loaded && !selectedSeats.length" class="mt-6 text-gray-500">
      No seats booked for the selected flight and date.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import FlightSelect from "../../components/booking/FlightSelect.vue";
import DatePicker from "../../components/booking/DatePicker.vue";
import SeatMap from "../../components/booking/SeatMap.vue";
import { useBookings } from "../../modules/useBookings";
import { useTickets } from "../../modules/useTicket";
import { useFlights } from "../../modules/useFlights";

// Composables
const { disabledDates, selectedFlightData, formatLocalDate } = useBookings();
const { getBookedSeats, availableSeats, selectedSeats, bookedSeats } =
  useTickets();
const {
  flights,
  fetchFlights,
  error: flightError,
  loading: flightLoading,
} = useFlights();

// Local state
const departureAirport = ref<string | null>(null);
const arrivalAirport = ref<string | null>(null);
const selectedFlight = ref<string | null>(null);
const selectedDate = ref<Date | undefined>(undefined);

const loaded = ref(false);

onMounted(() => {
  fetchFlights();
});

// Whenever `selectedFlight` changes, update `selectedFlightData`
watch(selectedFlight, (flightId) => {
  const flight = flights.value.find((f) => f._id === flightId) || null;
  selectedFlightData.value = flight;
});

// Debug: log `disabledDates` whenever it updates
watch(disabledDates, () => {
  // console.log("ADMIN disabledDates:", disabledDates.value);
});

const loadingSeats = ref(false);

// Watch for changes in selected flight and date to fetch booked seats
watch([selectedFlight, selectedDate], async ([flightId, date]) => {
  if (flightId && date instanceof Date) {
    loadingSeats.value = true;
    const formattedDate = formatLocalDate(date);
    bookedSeats.value = await getBookedSeats(flightId, formattedDate);
    loadingSeats.value = false;
    // console.log("Booked seats for", formattedDate, ":", bookedSeats.value);
  }
});
// Load selected seats for the chosen flight & date
const loadSelectedSeats = async () => {
  if (!selectedFlight.value || !selectedDate.value) return;

  // Make sure selectedDate is in local time
  const localDate = new Date(selectedDate.value);
  const localDateString = localDate.toLocaleDateString("en-CA");

  // Use the formatted date without time component to avoid timezone issues
  selectedSeats.value = await getBookedSeats(
    selectedFlight.value,
    localDateString
  );
  loaded.value = true;
};
</script>
