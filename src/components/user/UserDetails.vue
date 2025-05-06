<template>
  <div class="bg-white shadow-md rounded-xl p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4">👤 My Profile</h2>

    <!-- Profile Information -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 mb-6"
    >
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Phone:</strong> {{ user.phone }}</p>
      <p><strong>Date of Birth:</strong> {{ formattedDOB }}</p>
    </div>

    <!-- Update Profile Section -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">✏️ Update Profile</h3>
      <form
        @submit.prevent="handleUpdateProfile"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          v-model="user.name"
          type="text"
          placeholder="Name"
          class="input"
        />
        <input
          v-model="user.phone"
          type="text"
          placeholder="Phone"
          class="input"
        />
        <input
          v-model="user.email"
          type="email"
          placeholder="Email"
          class="input"
        />
        <button type="submit" class="btn col-span-1 sm:col-span-2">
          Update Profile
        </button>
      </form>
    </div>

    <!-- Change Password Section -->
    <div>
      <h3 class="text-lg font-semibold mb-2">🔒 Change Password</h3>
      <form
        @submit.prevent="handleChangePassword"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          v-model="currentPassword"
          type="password"
          placeholder="Current Password"
          class="input"
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="New Password"
          class="input"
        />
        <button type="submit" class="btn col-span-1 sm:col-span-2">
          Change Password
        </button>
      </form>
    </div>

    <p v-if="successMessage" class="text-green-500 mt-4">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { User } from "@/interfaces/interfaces";
import { useUsers } from "@/modules/auth/useUsers";

// Props for v-model
const props = defineProps<{ modelValue: User }>();
const emit = defineEmits<{ (e: "update:modelValue", user: User): void }>();

const user = ref<User>({ ...props.modelValue });

const { updateUserProfile, changeUserPassword } = useUsers();

// Inputs for password change
const currentPassword = ref("");
const newPassword = ref("");

// Feedback messages
const successMessage = ref("");
const errorMessage = ref("");

// Formatted DOB (based on local user ref)
const formattedDOB = computed(() => {
  const dob = user.value.dateOfBirth;
  if (!dob) return "";
  const d = new Date(dob);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
});

// Handlers
const handleUpdateProfile = async () => {
  try {
    await updateUserProfile({
      name: user.value.name,
      phone: user.value.phone,
      email: user.value.email,
    });

    successMessage.value = "Profile updated successfully!";
    errorMessage.value = "";

    // Emit changes to parent
    emit("update:modelValue", user.value);
  } catch (err) {
    successMessage.value = "";
    errorMessage.value = (err as Error).message;
  }
};

const handleChangePassword = async () => {
  try {
    await changeUserPassword(currentPassword.value, newPassword.value);

    successMessage.value = "Password changed successfully!";
    errorMessage.value = "";

    currentPassword.value = "";
    newPassword.value = "";
  } catch (err) {
    successMessage.value = "";
    errorMessage.value = (err as Error).message;
  }
};
</script>

<style scoped>
.input {
  @apply border p-2 rounded w-full;
}
.btn {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded;
}
</style>
