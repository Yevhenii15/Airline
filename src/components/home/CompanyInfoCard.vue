<template>
  <section
    class="w-full bg-gradient-to-br from-black via-zinc-900 to-black bg-opacity-80 rounded-3xl shadow-2xl border border-[#ff7f50] p-10 text-white mt-8 space-y-8"
  >
    <h2
      class="text-5xl font-extrabold text-center mb-4 tracking-wide text-[#ff7f50]"
    >
      About FlyEAZY
    </h2>
    <div
      v-if="loading"
      class="text-center text-orange-300 text-xl font-semibold"
    >
      🔄 Loading company information...
    </div>
    <div
      v-else-if="error"
      class="text-center text-red-400 text-xl font-semibold"
    >
      ❗ {{ error }}
    </div>
    <div v-else class="space-y-8">
      <div class="bg-zinc-800 p-6 rounded-xl shadow-inner">
        <h3 class="text-[#ff7f50] text-2xl font-bold mb-3">Who We Are</h3>
        <p class="text-gray-200 text-lg leading-relaxed">
          {{ modelValue.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">
            Company Name
          </h4>
          <p class="text-white text-base">{{ modelValue.name }}</p>
        </div>

        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Address</h4>
          <p class="text-white text-base">{{ modelValue.address }}</p>
        </div>

        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Phone</h4>
          <p class="text-white text-base">{{ modelValue.phone }}</p>
        </div>

        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Email</h4>
          <p class="text-white text-base">{{ modelValue.email }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineModel } from "vue";
import { useCompany } from "../../modules/useCompany";

import { computed } from "vue";

const rawModel = defineModel<{
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}>();

const modelValue = computed(
  () =>
    rawModel.value ?? {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
    }
);

const { loading, error } = useCompany();
</script>
