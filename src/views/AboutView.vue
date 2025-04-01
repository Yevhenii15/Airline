<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-300">
      <h2 class="text-3xl font-extrabold text-gray-800 text-center mb-6">
        Company Information
      </h2>

      <div v-if="loading" class="text-center text-xl font-semibold text-orange-500">
        Updating information...
      </div>
      <div v-else-if="error" class="text-center text-red-500 text-xl">
        {{ error }}
      </div>

      <div v-if="!isEditing">
        <!-- Display company info as plain text -->
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium">Company Name</label>
            <p class="text-black">{{ companyData.name }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Description</label>
            <p class="text-black">{{ companyData.description }}</p>
            
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Address</label>
            <p class="text-black">{{ companyData.address }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Phone</label>
            <p class="text-black">{{ companyData.phone }}</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Email</label>
            <p class="text-black">{{ companyData.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
          
        
       </template>


<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";
import { useCompany } from "../modules/useCompany";

const { aboutCompany, loading, error, fetchAboutInfo, updateAboutInfo } = useCompany();

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
