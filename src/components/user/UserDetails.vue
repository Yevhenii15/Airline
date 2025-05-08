<template>
  <div
    class="bg-zinc-800 p-8 rounded-3xl shadow-2xl border border-[#ff7f50] text-white space-y-8"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg text-gray-200">
      <p>
        <span class="font-semibold text-[#ff7f50]">Name:</span> {{ user.name }}
      </p>
      <p>
        <span class="font-semibold text-[#ff7f50]">Email:</span>
        {{ user.email }}
      </p>
      <p>
        <span class="font-semibold text-[#ff7f50]">Phone:</span>
        {{ user.phone }}
      </p>
      <p>
        <span class="font-semibold text-[#ff7f50]">Date of Birth:</span>
        {{ formattedDOB }}
      </p>
    </div>

    <!-- Update Profile -->
    <div>
      <h3 class="text-xl font-bold mb-3 text-[#ff7f50]">✏️ Update Profile</h3>
      <form
        @submit.prevent="handleUpdateProfile"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          v-model="user.name"
          type="text"
          placeholder="Name"
          class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
        />
        <input
          v-model="user.phone"
          type="text"
          placeholder="Phone"
          class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
        />
        <input
          v-model="user.email"
          type="email"
          placeholder="Email"
          class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
        />
        <button
          type="submit"
          class="col-span-1 sm:col-span-2 bg-[#ff7f50] text-black font-semibold py-2 rounded-md hover:bg-orange-500 transition"
        >
          Update Profile
        </button>
      </form>
    </div>

    <!-- Change Password -->
    <div>
      <h3 class="text-xl font-bold mb-3 text-[#ff7f50]">🔒 Change Password</h3>
      <form
        @submit.prevent="handleChangePassword"
        class="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input
          v-model="currentPassword"
          type="password"
          placeholder="Current Password"
          class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
        />
        <input
          v-model="newPassword"
          type="password"
          placeholder="New Password"
          class="w-full p-3 bg-white border border-[#ff7f50] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff7f50]"
        />
        <button
          type="submit"
          class="col-span-1 sm:col-span-2 bg-[#ff7f50] text-black font-semibold py-2 rounded-md hover:bg-orange-500 transition"
        >
          Change Password
        </button>
      </form>
    </div>

    <!-- Messages -->
    <p v-if="successMessage" class="text-green-400 mt-4 text-sm">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="text-red-400 mt-4 text-sm">
      {{ errorMessage }}
    </p>
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
