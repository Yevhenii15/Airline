<template>
  <div
    class="w-full sm:w-[48%] font-sans text-gray-200 bg-zinc-800 p-5 border border-[#ff7f50] rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
  >
    <div
      class="flex justify-between items-center border-b-2 border-[#ff7f50] pb-4 pt-2"
    >
      <h1 class="text-2xl font-bold text-[#ff7f50]">FLYEAZY</h1>
      <div class="text-right flex gap-6">
        <div>
          <div class="text-sm text-[#ff7f50]">DATE</div>
          <div class="text-base">
            {{ formatDate(ticket?.departureDate) || "N/A" }}
          </div>
        </div>
        <div>
          <div class="text-sm text-[#ff7f50]">FLY OUT</div>
          <div class="text-base">
            {{ ticket?.departureTime || "N/A" }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center mt-5 pt-4">
      <div class="text-center w-[35%]">
        <div class="text-base">{{ ticket?.departureAirportName }}</div>
        <div class="text-4xl font-bold text-[#ff7f50]">
          {{ ticket?.departureIATA }}
        </div>
      </div>
      <div class="text-3xl">✈</div>
      <div class="text-center w-[35%]">
        <div class="text-base">{{ ticket?.arrivalAirportName }}</div>
        <div class="text-4xl font-bold text-[#ff7f50]">
          {{ ticket?.arrivalIATA }}
        </div>
      </div>
    </div>

    <div class="mt-5 py-5">
      <div class="text-xl text-[#ff7f50] font-normal">PASSENGER</div>
      <div class="text-2xl font-bold">
        {{ ticket?.firstName }} {{ ticket?.lastName }}
      </div>
      <div class="flex justify-between gap-4 py-4 text-sm">
        <div>
          <div class="text-[#ff7f50]">FLIGHT #</div>
          <div>{{ ticket?.flightNumber || "N/A" }}</div>
        </div>
        <div>
          <div class="text-[#ff7f50]">SEAT</div>
          <div>{{ ticket?.seatNumber || "N/A" }}</div>
        </div>
        <div class="text-right">
          <div class="text-[#ff7f50]">STATUS</div>
          <div class="font-bold">
            {{ ticket?.flightStatus || "N/A" }}
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-6 mb-4">
      <div
        class="bg-white inline-block p-5 w-[45%] rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      >
        <img
          v-if="ticket?.qrDataUrl"
          :src="ticket.qrDataUrl"
          alt="QR Code"
          class="w-full h-auto mx-auto"
        />
      </div>
    </div>

    <div class="text-xs text-gray-400 mt-2 text-center">
      Checked in at: {{ formatDateTime(ticket?.checkInTime) || "N/A" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
});

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};
const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString();
};
</script>
