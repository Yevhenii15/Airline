<template>
  <div
    v-for="(ticket, index) in model!"
    :key="index"
    class="p-6 rounded-2xl mt-6 bg-[#181818] shadow-lg border border-[#ff7f50] transition-transform hover:scale-[1.01]"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="block text-sm text-white mb-1">First Name</label>
        <input
          v-model="ticket.firstName"
          placeholder="First Name"
          class="w-full p-3 border bg-white border-[#ff7f50] rounded-lg text-black placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <label class="block text-sm text-white mb-1">Last Name</label>
        <input
          v-model="ticket.lastName"
          placeholder="Last Name"
          class="w-full p-3 border bg-white border-[#ff7f50] rounded-lg text-black placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <label class="block text-sm text-white mb-1">Gender</label>
        <select
          v-model="ticket.gender"
          class="w-full p-3 border bg-white border-[#ff7f50] rounded-lg text-black"
        >
          <option value="Male" class="text-black">Male</option>
          <option value="Female" class="text-black">Female</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-white mb-1">Seat Number</label>
        <input
          v-model="ticket.seatNumber"
          placeholder="Seat Number"
          class="w-full p-3 border bg-white border-[#ff7f50] rounded-lg text-black"
          disabled
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm text-white mb-1">Ticket Price</label>
        <input
          v-model.number="ticket.ticketPrice"
          type="number"
          class="w-full p-3 border bg-white border-[#ff7f50] rounded-lg text-black"
          disabled
        />
      </div>
    </div>
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
