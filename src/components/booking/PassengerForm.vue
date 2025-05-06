<template>
  <div
    v-for="(ticket, index) in model!"
    :key="index"
    class="bg-gray-100 p-6 rounded-lg mt-4"
  >
    <input
      v-model="ticket.firstName"
      placeholder="First Name"
      class="w-full p-3 border border-blue-500 rounded-lg text-black"
      required
    />
    <input
      v-model="ticket.lastName"
      placeholder="Last Name"
      class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
      required
    />
    <select
      v-model="ticket.gender"
      class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
    >
      <option value="Male" class="text-black">Male</option>
      <option value="Female" class="text-black">Female</option>
    </select>
    <input
      v-model="ticket.seatNumber"
      placeholder="Seat Number"
      class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
      disabled
    />
    <input
      v-model.number="ticket.ticketPrice"
      type="number"
      class="w-full p-3 border border-blue-500 rounded-lg mt-4 text-black"
      disabled
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<
  {
    firstName: string;
    lastName: string;
    gender: string;
    seatNumber: string;
    ticketPrice: number;
  }[]
>();
</script>
