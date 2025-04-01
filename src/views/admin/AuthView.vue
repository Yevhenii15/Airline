<template>
  <div class="flex h-max">
    <!-- Left side with background image -->
    <div
      class="w-1/2 bg-cover bg-center"
      style="background-image: url('https://picsum.photos/800/1200'); background-color: #181818;"
    ></div>

    <!-- Right side with login and register forms -->
    <div class="w-1/2 bg-[#181818] flex-grow text-white flex flex-col p-8">
      <!-- Top part: Login and Logout -->
      <div class="mb-8">
        <p class="text-3xl font-bold mb-6">Welcome to FlyEAZY</p>
        <input
          type="text"
          class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none"
          placeholder="Email"
          v-model="email"
        />
        <input
          type="password"
          class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none"
          placeholder="Password"
          v-model="password"
        />
        <button
          class="bg-[#FF7F50] text-white p-2 rounded hover:bg-[#ff4500] w-full mt-4"
          @click="fetchToken(email, password)"
        >
          Login
        </button>
      </div>

      <!-- Lower part: Register -->
      <div class="register-block mt-auto">
        <p
          class="text-xl cursor-pointer text-[#FF7F50] font-semibold hover:text-[#FF4500]"
          @click="toggleRegisterDialog"
        >
          New here? Register now
        </p>
        <dialog ref="registerDialog" class="register-dialog">
          <form class="flex flex-wrap">
            <input
              type="text"
              class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none flex-1"
              placeholder="Name"
              v-model="name"
            />
            <input
              type="text"
              class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none flex-1"
              placeholder="Email"
              v-model="email"
            />
            <input
              type="text"
              class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none flex-1"
              placeholder="Phone"
              v-model="phone"
            />
            <input
              type="password"
              class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none flex-1 w-full"
              placeholder="Password"
              v-model="password"
            />
            <input
              type="date"
              class="m-2 p-2 border-b border-gray-500 bg-transparent text-white focus:outline-none flex-1"
              v-model="dateOfBirth"
            />
            <button
              class="bg-[#10B981] text-white p-2 rounded hover:bg-[#059669] w-full mt-4"
              @click.prevent="registerUser(name, email, phone, password, new Date(dateOfBirth))"
            >
              Register
            </button>
          </form>
          <button
            class="bg-red-600 text-white p-2 rounded hover:bg-red-700 w-full mt-2"
            @click="toggleRegisterDialog"
          >
            Close
          </button>
        </dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUsers } from "@/modules/auth/useUsers";

const { fetchToken, registerUser, logout, name, email, phone, password } =
  useUsers();
const registerDialog = ref<HTMLDialogElement | null>(null);
const dateOfBirth = ref<string>(""); // Store the date as a string

const toggleRegisterDialog = () => {
  if (registerDialog.value) {
    if (registerDialog.value.open) {
      registerDialog.value.close();
    } else {
      registerDialog.value.show();
    }
  }
};
</script>

<style scoped>
.register-block {
  display: flex;
  position: relative;
  margin-top: auto;
}

.register-dialog {
  background-color: #181818;
  border-left: 1px solid #9ca3af;
  padding: 1rem;
  position: absolute;
  top: 8rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.register-dialog[open] {
  opacity: 1;
  pointer-events: inherit;
}

.register-dialog::backdrop {
  background-color: rgba(0, 0, 255, 0.2);
}

input {
  border-radius: 8px;
}

button {
  border-radius: 8px;
  font-weight: bold;
}


</style>
