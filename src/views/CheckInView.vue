<template>
  <Suspense>
    <template #default>
      <div class="p-4 max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Flight Check-In</h1>

        <div v-if="bookings.length === 0 && !loading">No bookings found.</div>
        <div v-if="loading">Loading bookings...</div>

        <div v-if="selectedBooking">
          <h2 class="text-xl font-semibold mb-2">
            Booking ID: {{ selectedBooking._id }}
          </h2>

          <form @submit.prevent="submitCheckIn">
            <div
              v-for="(ticket, index) in selectedBooking.tickets"
              :key="
                ticket.ticket_id ||
                `temp-${ticket.firstName}-${ticket.lastName}`
              "
              class="mb-6 border p-4 rounded-lg shadow"
            >
              <h3 class="font-semibold mb-2">
                Passenger {{ index + 1 }}: {{ ticket.firstName }}
                {{ ticket.lastName }}
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                <input
                  v-model="checkInData[getTicketId(ticket)].passportNumber"
                  type="text"
                  placeholder="Passport Number"
                  class="input"
                  required
                />
                <input
                  v-model="checkInData[getTicketId(ticket)].nationality"
                  type="text"
                  placeholder="Nationality"
                  class="input"
                  required
                />
                <input
                  v-model="checkInData[getTicketId(ticket)].dateOfBirth"
                  type="date"
                  class="input"
                  required
                  :min="minBirthdate"
                  @change="validateBirthdate(ticket)"
                />
                <input
                  v-model="checkInData[getTicketId(ticket)].expirationDate"
                  type="date"
                  class="input"
                  required
                  :min="minExpirationDate(ticket)"
                  @change="validateExpirationDate(ticket)"
                />
              </div>

              <div
                v-if="errors[getTicketId(ticket)]?.expirationDate"
                class="text-red-600 mt-2"
              >
                {{ errors[getTicketId(ticket)].expirationDate }}
              </div>
              <div
                v-if="errors[getTicketId(ticket)]?.dateOfBirth"
                class="text-red-600 mt-2"
              >
                {{ errors[getTicketId(ticket)].dateOfBirth }}
              </div>
            </div>

            <button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              :disabled="submitting"
            >
              {{ submitting ? "Checking in..." : "Check In All Passengers" }}
            </button>
          </form>

          <div v-if="success" class="text-green-600 mt-4 font-semibold">
            All passengers checked in successfully!
          </div>

          <div v-if="generatedTickets.length" class="mt-6">
            <h3 class="text-lg text-center font-semibold mb-2">
              Generated Tickets
            </h3>
            <div class="flex flex-wrap justify-center gap-4">
              <div
                v-for="(ticketHtml, index) in generatedTickets"
                :key="index"
                v-html="ticketHtml"
                class="w-[45%]"
              ></div>
            </div>
            <div class="flex justify-center mt-4 gap-4 w-100%">
              <button
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                @click="() => downloadTickets(generatedTickets)"
              >
                Download Tickets
              </button>
            </div>
          </div>
        </div>

        <div v-if="!selectedBooking && bookings.length">
          <BookingSelect
            :availableBookings="availableBookings"
            :selectedBookingId="selectedBookingId"
            @update:selectedBookingId="selectedBookingId = $event"
            @selectBooking="selectBooking"
          />
        </div>
      </div>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from "vue";
import { useBookings } from "../modules/useBookings";
import { useCheckIn } from "../modules/useCheckIn";
import { useAirports } from "../modules/useAirports";
import type { Booking } from "../interfaces/interfaces";
import BookingSelect from "../components/checkIn/BookingSelect.vue";
import { useFlights } from "../modules/useFlights";
import QRCode from "qrcode";

const { fetchAirports } = useAirports();
onMounted(() => {
  fetchAirports();
});
const { bookings, loading, fetchUserBookings } = useBookings();
const { checkIn, generateTicketHTML, downloadTickets, saveTicket } =
  useCheckIn();

const selectedBookingId = ref<string>("");
const selectedBooking = ref<Booking | null>(null);
const checkInData = reactive<
  Record<
    string,
    {
      passportNumber: string;
      nationality: string;
      dateOfBirth: string;
      expirationDate: string;
    }
  >
>({});
const errors = reactive<
  Record<string, { expirationDate?: string; dateOfBirth?: string }>
>({});
const submitting = ref(false);
const success = ref(false);
const generatedTickets = ref<string[]>([]);

onMounted(async () => {
  await fetchUserBookings();
});

const selectBooking = () => {
  const booking = bookings.value.find((b) => b._id === selectedBookingId.value);
  if (booking) {
    selectedBooking.value = booking;
    for (const ticket of booking.tickets) {
      const ticketId = getTicketId(ticket);
      checkInData[ticketId] = {
        passportNumber: "",
        nationality: "",
        dateOfBirth: "",
        expirationDate: "",
      };
    }
  }
};

const getTicketId = (ticket: any) => {
  return ticket._id || `temp-${ticket.firstName}-${ticket.lastName}`;
};

const { fetchFlightById } = useFlights();

const submitCheckIn = async () => {
  if (!selectedBooking.value) return;

  submitting.value = true;
  success.value = false;
  generatedTickets.value = [];

  try {
    const validTickets = selectedBooking.value.tickets.filter(
      (ticket) => ticket._id // Ensure we're using the correct ticket ID
    );

    const ticketFlightPairs = await Promise.all(
      validTickets.map(async (ticket) => {
        const ticketId = getTicketId(ticket); // Ensure this returns the correct ticket ID
        const passengerData = checkInData[ticketId];
        const flight = await fetchFlightById(ticket.flight_id);

        return { ticket, ticketId, passengerData, flight };
      })
    );

    for (const {
      ticket,
      ticketId,
      passengerData,
      flight,
    } of ticketFlightPairs) {
      if (!ticketId || !passengerData || !flight) continue;

      await checkIn(ticketId, passengerData);

      const qrPayload = {
        name: `${ticket.firstName} ${ticket.lastName}`,
        flight: flight.flightNumber,
        passport: passengerData.passportNumber,
        dateOfBirth: passengerData.dateOfBirth,
        nationality: passengerData.nationality,
        expirationDate: passengerData.expirationDate,
      };

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

      const ticketHTML = generateTicketHTML(
        ticket,
        passengerData,
        qrDataUrl,
        flight
      );
      generatedTickets.value.push(ticketHTML);

      // Fix: Ensure the value is a string (fallback to empty string if undefined)
      saveTicket(
        ticketHTML,
        passengerData.expirationDate || "", // Ensure a string is passed here
        `${ticket.firstName} ${ticket.lastName}`,
        ticket._id || "" // Ensure a string is passed here
      );
    }

    success.value = true;
  } catch (err) {
    console.error("❌ Check-in error:", err);
  } finally {
    submitting.value = false;
  }
};

const minExpirationDate = (ticket: any) => {
  const departureDate = new Date(ticket.departureDate);
  departureDate.setMonth(departureDate.getMonth() + 3);
  return departureDate.toISOString().split("T")[0]; // Set minimum expiration date to 3 months ahead
};

const minBirthdate = "1900-01-01"; // Set the minimum birthdate to a valid past date

const validateExpirationDate = (ticket: any) => {
  const expirationDate = new Date(
    checkInData[getTicketId(ticket)].expirationDate
  );
  const departureDate = new Date(ticket.departureDate);
  if (expirationDate < departureDate) {
    errors[getTicketId(ticket)] = {
      ...errors[getTicketId(ticket)],
      expirationDate:
        "Expiration date must be at least 3 months after departure",
    };
  } else {
    errors[getTicketId(ticket)] = {
      ...errors[getTicketId(ticket)],
      expirationDate: undefined,
    };
  }
};

const validateBirthdate = (ticket: any) => {
  const birthDate = new Date(checkInData[getTicketId(ticket)].dateOfBirth);
  if (birthDate > new Date()) {
    errors[getTicketId(ticket)] = {
      ...errors[getTicketId(ticket)],
      dateOfBirth: "Birthdate cannot be a future date",
    };
  } else {
    errors[getTicketId(ticket)] = {
      ...errors[getTicketId(ticket)],
      dateOfBirth: undefined,
    };
  }
};

const availableBookings = computed(() =>
  bookings.value.filter(
    (booking) =>
      booking.tickets.every(
        (ticket) =>
          ticket.isCheckedIn !== true &&
          new Date(ticket.departureDate) > new Date()
      ) && new Date(booking.tickets[0].departureDate) > new Date()
  )
);
</script>

<style scoped>
.input {
  @apply border p-2 rounded w-full;
}
</style>
