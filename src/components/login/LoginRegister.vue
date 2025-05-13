<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    @click.self="closePopup"
  >
    <div class="bg-[#181818] p-6 rounded-xl w-80 text-white">
      <p class="text-2xl font-semibold mb-4">Login / Register</p>

      <!-- Login Form -->
      <div v-if="isLoginForm">
        <input
          type="text"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Email"
          v-model="email"
        />
        <input
          type="password"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Password"
          v-model="password"
        />

        <button
          class="bg-[#FF7F50] text-white p-2 rounded hover:bg-[#ff4500] w-full mt-4"
          @click="handleLogin"
        >
          Login
        </button>

        <p
          class="text-sm text-[#FF7F50] cursor-pointer mt-4 text-center"
          @click="toggleForm"
        >
          New here? Create an account
        </p>
      </div>

      <!-- Register Form -->
      <div v-else>
        <input
          type="text"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Full Name"
          v-model="name"
        />
        <input
          type="text"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Email"
          v-model="email"
        />
        <input
          type="password"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Password"
          v-model="password"
        />
        <input
          type="text"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          placeholder="Phone"
          v-model="phone"
        />
        <input
          type="date"
          class="w-full p-2 border-b border-gray-500 bg-transparent mb-4"
          v-model="dateOfBirth"
        />

        <button
          class="bg-[#10B981] text-white p-2 rounded hover:bg-[#059669] w-full mt-4"
          @click="handleRegister"
        >
          Register
        </button>

        <p
          class="text-sm text-[#FF7F50] cursor-pointer mt-4 text-center"
          @click="toggleForm"
        >
          Already have an account? Login
        </p>
      </div>

      <button
        class="bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full mt-2"
        @click="closePopup"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { useUsers } from "@/modules/auth/useUsers";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["close"]);

const { fetchToken, registerUser, email, password, name, phone } = useUsers();

const dateOfBirth = ref("");
const isLoginForm = ref(true);

const closePopup = () => {
  emit("close");
};

const toggleForm = () => {
  isLoginForm.value = !isLoginForm.value;
};

const handleLogin = async () => {
  try {
    await fetchToken(email.value, password.value, router); // Pass router here
    resetInputs(); // Reset inputs after login
    closePopup();
  } catch (error) {
    alert("Login failed. Please try again.");
  }
};
const handleRegister = async () => {
  try {
    await registerUser(
      name.value,
      email.value,
      phone.value,
      password.value,
      new Date(dateOfBirth.value),
      false, // isAdmin value, set it to false for regular users
      router // Pass the router directly from setup()
    );
    resetInputs(); // Reset inputs after registration
    closePopup();
  } catch (error) {
    alert("Registration failed. Please try again.");
  }
};

// Function to reset inputs
const resetInputs = () => {
  email.value = "";
  password.value = "";
  name.value = "";
  phone.value = "";
  dateOfBirth.value = "";
};
</script>
