<template>
  <div class="seat-map" v-if="props.seatMap.length">
    <div v-for="row in rows" :key="row" class="seat-row">
      <button
        v-for="seat in seats"
        :key="seat"
        :class="['seat', getSeatClass(row, seat)]"
        @click="selectSeat(row, seat)"
        :disabled="isSeatDisabled(row, seat)"
      >
        {{ row }}{{ seat }}
      </button>
    </div>

    <!-- Legend -->
    <div class="flex gap-4 mt-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-[#8bc34a] border rounded"></div>
        Available
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-[#f44336] border rounded"></div>
        Taken
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-[#03a9f4] border rounded"></div>
        Selected
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-4">Loading seat map...</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  seatMap: { _id: string; seatNumber: string; status: string }[];
  selectedSeats: string[];
}>();

const emit = defineEmits<{
  (event: "select-seat", seatId: string): void;
}>();

const rows = Array.from({ length: 32 }, (_, i) => (i + 1).toString());
const seats = ["A", "B", "C", "D", "E", "F"];

const getSeatClass = (row: string, seat: string) => {
  const seatId = `${row}${seat}`;
  const seatObj = props.seatMap.find((s) => s.seatNumber === seatId);

  if (props.selectedSeats.includes(seatId)) return "selected";
  if (seatObj?.status === "booked") return "taken";
  return "available";
};

const isSeatDisabled = (row: string, seat: string) => {
  const seatId = `${row}${seat}`;
  return props.seatMap.some(
    (s) => s.seatNumber === seatId && s.status === "booked"
  );
};

const selectSeat = (row: string, seat: string) => {
  const seatId = `${row}${seat}`;
  const seatObj = props.seatMap.find((s) => s.seatNumber === seatId);
  if (seatObj?.status !== "booked") {
    emit("select-seat", seatId);
  }
};
</script>

<style scoped>
.seat {
  width: 40px;
  height: 40px;
  margin: 5px;
  background-color: #8bc34a;
  border: 1px solid #388e3c;
  border-radius: 5px;
  text-align: center;
  line-height: 40px;
  font-weight: bold;
  cursor: pointer;
  color: white;
}

.seat.taken {
  background-color: #f44336;
  cursor: not-allowed;
}

.seat.selected {
  background-color: #03a9f4;
}

.seat-row {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
</style>
