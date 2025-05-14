<template>
  <div
    class="max-w-4xl mx-auto p-6 bg-black shadow-2xl my-10 rounded-2xl border border-[#ff7f50]"
  >
    <!-- Flight Details -->
    <div
      v-if="selectedFlight && selectedDate && numberOfPassengers"
      class="mb-10 p-6 bg-[#181818] rounded-xl border border-[#ff7f50]"
    >
      <h3
        class="text-3xl font-semibold text-[#ff7f50] mb-6 text-center tracking-wide"
      >
        Flight Details
      </h3>
      <div class="flex gap-4 text-white text-base">
        <div class="w-1/2">
          <p>
            <span class="font-medium text-lg">Flight Number:</span>
            <span class="ml-2">{{ selectedFlightData?.flightNumber }}</span>
          </p>
          <p>
            <span class="font-medium text-lg">From:</span>
            <span class="ml-2">
              {{
                (selectedFlightData?.route?.departureAirport_id &&
                  airportNameMap[
                    selectedFlightData.route.departureAirport_id
                  ]) ||
                "Unknown"
              }}
            </span>
          </p>
          <p>
            <span class="font-medium text-lg">To:</span>
            <span class="ml-2">
              {{
                (selectedFlightData?.route?.arrivalAirport_id &&
                  airportNameMap[selectedFlightData.route.arrivalAirport_id]) ||
                "Unknown"
              }}
            </span>
          </p>

          <p>
            <span class="font-medium text-lg">Date:</span>
            <span class="ml-2">{{ selectedDate.toLocaleDateString() }}</span>
          </p>
        </div>
        <div>
          <p>
            <span class="font-medium text-lg">Departure Time:</span>
            <span class="ml-2">{{ selectedFlightData?.departureTime }}</span>
          </p>
          <p>
            <span class="font-medium text-lg">Arrival Time:</span>
            <span class="ml-2">{{ selectedFlightData?.arrivalTime }}</span>
          </p>
          <p>
            <span class="font-medium text-lg">Passengers:</span>
            <span class="ml-2">{{ numberOfPassengers }}</span>
          </p>
          <p>
            <span class="font-medium text-lg">Base Price:</span>
            <span class="ml-2">${{ selectedFlightData?.basePrice }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Seat selection -->
    <h2 class="text-2xl font-bold text-[#ff7f50] mb-4 text-center">
      Choose Seats
    </h2>
    <div v-if="selectedFlight && selectedDate && !loadingSeats" class="mb-8">
      <SeatMap
        :seat-map="availableSeats"
        :selected-seats="selectedSeats"
        @select-seat="handleSeatSelect"
      />
    </div>
    <p v-if="loadingSeats" class="text-[#ff7f50] font-medium mt-4 text-center">
      Loading seats...
    </p>

    <!-- Passenger Info -->
    <div v-if="selectedSeats.length > 0">
      <h2 class="text-2xl font-bold text-[#ff7f50] mb-6 text-center">
        Passenger Info
      </h2>
      <PassengerForm v-model="tickets" />
    </div>

    <!-- Total Price -->
    <div
      class="mt-8 flex justify-between items-center bg-[#181818] p-4 rounded-lg border border-[#ff7f50]"
    >
      <h3 class="text-xl font-bold text-[#ff7f50]">Total Price</h3>
      <h3 class="text-white font-bold text-xl">${{ totalPrice }}</h3>
    </div>

    <!-- Booking button -->
    <button
      @click="submitBooking"
      :disabled="bookingLoading"
      class="mt-8 w-full bg-[#22c55e] text-white text-lg font-semibold px-6 py-3 rounded-lg transition-all hover:bg-[#16a34a] disabled:bg-gray-500 disabled:cursor-not-allowed"
    >
      {{ bookingLoading ? "Processing..." : "Confirm Booking" }}
    </button>

    <!-- Error message -->
    <p v-if="error" class="text-red-500 mt-4 text-center font-medium">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Import components
import SeatMap from "../components/booking/SeatMap.vue";
import PassengerForm from "../components/booking/PassengerForm.vue";

// Import composables and hooks
import { useBookings } from "../modules/useBookings";
import { useFlights } from "../modules/useFlights";
import { useUsers } from "../modules/auth/useUsers";
import { useTickets } from "../modules/useTicket";
import type { Booking } from "../interfaces/interfaces";
import { useRoute } from "vue-router";
import { useAirports } from "../modules/useAirports";

// Composables
const { airportNameMap, fetchAirports } = useAirports();

const {
  createBooking,
  loading: bookingLoading,
  error,
  selectedFlightData,
  disabledDates,
  formatLocalDate,
} = useBookings();

const { loading: flightLoading, flights, fetchFlights } = useFlights();
const { getTokenAndUserId } = useUsers();
const {
  getBookedSeats,
  bookedSeats,
  selectedSeats,
  numberOfPassengers,
  tickets,
  availableSeats,
  handleSeatSelect,
} = useTickets();

onMounted(() => {
  fetchAirports();
});

const route = useRoute();

onMounted(() => {
  if (route.query.flight) {
    selectedFlight.value = route.query.flight as string;
  }

  if (route.query.date) {
    selectedDate.value = new Date(route.query.date as string);
  }

  if (route.query.passengers) {
    numberOfPassengers.value = parseInt(route.query.passengers as string);
  }
});

// State variables
const userId = ref<string | null>(null);
const selectedFlight = ref<string | null>(null);
const selectedDate = ref<Date | undefined>(undefined);
const loadingSeats = ref(false);

// Fetch user ID when component mounts
onMounted(() => {
  try {
    const { userId: fetchedUserId } = getTokenAndUserId();
    userId.value = fetchedUserId;
  } catch (err) {
    // console.error("Error fetching user ID:", err);
  }
});

// Fetch flights data on mount
onMounted(() => fetchFlights());

watchEffect(() => {
  if (!selectedFlight.value || flights.value.length === 0) return;

  const flight = flights.value.find((f) => f._id === selectedFlight.value);
  if (flight) {
    selectedFlightData.value = flight;

    // Update ticket prices only once when basePrice is known
    tickets.value.forEach((ticket) => {
      ticket.ticketPrice = flight.basePrice || 0;
    });
  }
});

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

// Watch for changes in passenger count and update tickets
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

// Compute total price based on selected tickets
const totalPrice = computed(() =>
  tickets.value.reduce((sum, t) => sum + t.ticketPrice, 0)
);

// Submit booking function
const submitBooking = async () => {
  if (!selectedFlight.value || !selectedDate.value) {
    alert("Please select a flight and a valid date");
    return;
  }

  try {
    const { userId, email } = getTokenAndUserId(); // Extract user ID and email

    const bookingData: Booking = {
      user_id: userId || "", // Use userId
      user_email: email || "", // Use email
      totalPrice: totalPrice.value,
      bookingDate: new Date().toISOString(),
      numberOfTickets: tickets.value.length,
      bookingStatus: "Confirmed",
      tickets: tickets.value.map((t, index) => ({
        ticket_id: `T100${index + 1}`,
        firstName: t.firstName,
        lastName: t.lastName,
        ticketPrice: t.ticketPrice,
        gender: t.gender as "Male" | "Female",
        seatNumber: t.seatNumber,
        flight_id: selectedFlight.value!,
        departureDate: formatLocalDate(selectedDate.value!),
      })),
    };

    // Create booking
    await createBooking(bookingData);

    // Save the latest booking data in localStorage (for persistence)
    localStorage.setItem("latestBooking", JSON.stringify(bookingData));

    // Redirect to the booking confirmation page
    router.push("/booking-confirmation");
  } catch (err) {
    alert("Booking failed. Please try again.");
  }
};

// Debug: Watch disabledDates (for any changes in disabled dates)
watch(disabledDates, () => {
  // console.log("Disabled Dates:", disabledDates.value);
});
</script>
