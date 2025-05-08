<template>
  <div class="p-6">
    <router-link
      to="/admin"
      class="inline-block mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
    >
      🔙 Back to Admin
    </router-link>
  </div>
  <section
    class="m-6 bg-gradient-to-br from-black via-zinc-900 to-black bg-opacity-80 rounded-3xl shadow-2xl border border-[#ff7f50] p-10 text-white mt-8 space-y-8"
  >
    <!-- Title -->
    <h2
      class="text-5xl font-extrabold text-center mb-4 tracking-wide text-[#ff7f50]"
    >
      Company Information
    </h2>

    <!-- Loading / Error -->
    <div
      v-if="loading"
      class="text-center text-orange-300 text-xl font-semibold"
    >
      🔄 Updating information...
    </div>
    <div
      v-else-if="error"
      class="text-center text-red-400 text-xl font-semibold"
    >
      ❗ {{ error }}
    </div>

    <!-- Company Info -->
    <div v-else class="space-y-8">
      <!-- Company Name (Always visible) -->
      <div class="bg-zinc-800 p-6 rounded-xl shadow-inner">
        <h3 class="text-[#ff7f50] text-2xl font-bold mb-3">Company Name</h3>
        <p class="text-white text-lg">{{ companyData.name }}</p>
      </div>

      <!-- Description -->
      <div class="bg-zinc-800 p-6 rounded-xl shadow-inner">
        <h3 class="text-[#ff7f50] text-2xl font-bold mb-3">Description</h3>
        <p class="text-gray-200 text-lg leading-relaxed">
          {{ companyData.description }}
        </p>
      </div>

      <!-- Contact Info Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Address</h4>
          <p class="text-white text-base">{{ companyData.address }}</p>
        </div>

        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Phone</h4>
          <p class="text-white text-base">{{ companyData.phone }}</p>
        </div>

        <div class="bg-zinc-800 p-5 rounded-xl">
          <h4 class="text-[#ff7f50] font-semibold text-lg mb-2">Email</h4>
          <p class="text-white text-base">{{ companyData.email }}</p>
        </div>
      </div>

      <!-- Edit Section -->
      <div v-if="!isEditing">
        <button
          @click="isEditing = true"
          class="bg-blue-600 text-white px-6 py-3 rounded-xl mt-4 font-semibold hover:bg-blue-700 transition duration-300"
        >
          Edit Information
        </button>
      </div>

      <!-- Edit Form -->
      <div v-else>
        <div class="space-y-6">
          <div>
            <label class="block text-gray-700 font-medium">Description</label>
            <textarea
              v-model="companyData.description"
              class="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            ></textarea>
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Address</label>
            <input
              v-model="companyData.address"
              type="text"
              class="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Phone</label>
            <input
              v-model="companyData.phone"
              type="text"
              class="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Email</label>
            <input
              v-model="companyData.email"
              type="email"
              class="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <button
            @click="handleUpdate"
            class="bg-blue-600 text-white px-6 py-3 rounded-xl w-full font-semibold hover:bg-blue-700 transition duration-300"
          >
            Update Information
          </button>
        </div>

        <!-- Cancel Edit Button -->
        <button
          @click="isEditing = false"
          class="bg-gray-600 text-white px-6 py-3 rounded-xl mt-4 font-semibold hover:bg-gray-700 transition duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { useCompany } from "../../modules/useCompany";

const { aboutCompany, loading, error, fetchAboutInfo, updateAboutInfo } =
  useCompany();

const companyData = ref({
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
});

const isEditing = ref(false);

onMounted(async () => {
  await fetchAboutInfo();
});

// Watch for changes in aboutCompany and update companyData accordingly
watchEffect(() => {
  if (aboutCompany.value) {
    companyData.value = { ...aboutCompany.value };
  }
});

const handleUpdate = async () => {
  await updateAboutInfo(companyData.value);
  isEditing.value = false; // Exit edit mode after update
};
</script>

<style scoped></style>
