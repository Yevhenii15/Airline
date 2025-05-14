<template>
  <div
    class="min-h-screen w-[100%] text-white flex flex-col items-center justify-center px-4 py-5"
  >
    <!-- Header / Booking Section -->
    <header
      class="bg-black bg-opacity-80 w-full max-w-3xl rounded-3xl shadow-2xl border border-[#ff7f50] p-10 mt-12 mb-8 text-center"
    >
      <h1 class="text-5xl font-extrabold mb-3 tracking-wide text-white">
        Welcome to <span class="text-[#ff7f50]">FlyEAZY</span>
      </h1>
      <p class="text-xl font-medium text-gray-300 mb-2">
        Your journey begins here
      </p>
      <p class="text-m text-gray-400 mb-6">Book your flight</p>

      <!-- Loading and Error -->
      <div v-if="flightLoading || bookingLoading" class="text-orange-300 mb-3">
        ⏳ Loading...
      </div>
      <div v-else-if="error" class="text-red-400 font-semibold mb-3">
        {{ error }}
      </div>

      <!-- Booking Form -->
      <div class="space-y-6 text-left" ref="flightSelectRef">
        <FlightSelect
          v-model:departureAirport="departureAirport"
          v-model:arrivalAirport="arrivalAirport"
          v-model:selectedFlight="selectedFlight"
        />

        <DatePicker
          v-if="selectedFlight"
          v-model="selectedDate"
          :disabledDates="disabledDates"
        />

        <!-- Passengers input -->
        <div v-if="selectedFlight && selectedDate">
          <label class="block text-[#ff7f50] font-medium mb-2">
            Number of Passengers:
          </label>
          <input
            v-model.number="numberOfPassengers"
            type="number"
            min="1"
            max="10"
            class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
            required
            placeholder="Enter number of passengers"
          />
        </div>

        <!-- Proceed button -->
        <button
          v-if="selectedFlight && selectedDate && numberOfPassengers > 0"
          @click="redirectToBooking"
          class="w-full bg-[#ff7f50] text-white font-semibold py-3 rounded-xl hover:bg-[#ff9566] transition duration-300"
        >
          ✈️ Proceed to Booking
        </button>
      </div>
    </header>
    <CompanyCartInfo v-model="aboutCompanySanitized" />
    <FlightCards
      :flights="flights"
      :loading="flightLoading"
      :error="error"
      @select-flight="handleFlightSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, watch, computed, nextTick } from "vue";
import type { Flight } from "../interfaces/interfaces";
import { useRouter } from "vue-router";

const router = useRouter();

import FlightSelect from "../components/booking/FlightSelect.vue";
import DatePicker from "../components/booking/DatePicker.vue";
import CompanyCartInfo from "../components/home/CompanyInfoCard.vue";
import FlightCards from "../components/home/FlightCard.vue";

import { useCompany } from "../modules/useCompany";
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useTickets } from "../modules/useTicket";

// Composables
const {
  loading: bookingLoading,
  error,
  selectedFlightData,
  disabledDates,
} = useBookings();

const { loading: flightLoading, flights, fetchFlights } = useFlights();
const { numberOfPassengers, tickets } = useTickets();
const { aboutCompany, fetchAboutInfo } = useCompany();

const companyData = ref({ name: "Loading..." });
const aboutCompanySanitized = computed(() => {
  const company = aboutCompany.value;
  if (!company)
    return { name: "", description: "", address: "", phone: "", email: "" };
  const { name, description, address, phone, email } = company;
  return { name, description, address, phone, email };
});

onMounted(async () => {
  await fetchAboutInfo();
});

watchEffect(() => {
  if (aboutCompany.value) {
    companyData.value = { ...aboutCompany.value };
  }
});

// Reference to the FlightSelect section
const flightSelectRef = ref<HTMLElement | null>(null);

// Scroll + pre-fill logic
const handleFlightSelection = async (flight: Flight) => {
  // Pre-fill flight selection
  departureAirport.value = flight.route.departureAirport_id;
  arrivalAirport.value = flight.route.arrivalAirport_id;
  selectedFlight.value = flight._id;

  // Scroll to FlightSelect section
  await nextTick();
  flightSelectRef.value?.scrollIntoView({ behavior: "smooth" });
};

// State
const departureAirport = ref<string | null>(null);
const arrivalAirport = ref<string | null>(null);
const selectedFlight = ref<string | null>(null);
const selectedDate = ref<Date | undefined>(undefined);

// Function to redirect to the BookingView
const redirectToBooking = () => {
  // Use 'lsToken' to get the token from localStorage
  const token = localStorage.getItem("lsToken");

  if (!token) {
    alert("Please log in before proceeding with the booking.");
    return; // Exit early if not logged in
  }

  if (selectedFlight.value && selectedDate.value) {
    router.push({
      name: "bookings",
      query: {
        flight: selectedFlight.value,
        date: selectedDate.value.toISOString(),
        passengers: numberOfPassengers.value.toString(),
      },
    });
  } else {
    alert("Please select a flight, date, and number of passengers.");
  }
};

// Fetch flights on mount
onMounted(() => fetchFlights());

// Watch selectedFlight to update selectedFlightData & ticket prices
watch(selectedFlight, (flightId) => {
  const flight = flights.value.find((f) => f._id === flightId);
  selectedFlightData.value = flight || null;

  // Update ticket prices when flight changes
  if (flight) {
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = flight.basePrice || 0;
    });
  }
});

// Watch passenger count to sync tickets
watch(numberOfPassengers, (count) => {
  const current = tickets.value.length;
  if (count > current) {
    for (let i = 0; i < count - current; i++) {
      tickets.value.push({
        firstName: "",
        lastName: "",
        gender: "Male",
        seatNumber: "",
        ticketPrice: selectedFlightData.value?.basePrice || 0,
      });
    }
  } else {
    tickets.value.splice(count);
  }
});

// Debug: Watch disabledDates
watch(disabledDates, () => {
  // console.log("Disabled Dates:", disabledDates.value);
});
</script>
