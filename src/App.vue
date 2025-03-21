<template class="w-screen">
  <header class="text-white py-4">
    <div class="wrapper">
      <nav class="">
        <RouterLink to="/" class="mr-4">Home</RouterLink>
        <RouterLink to="/about" class="mr-4">About</RouterLink>
        <RouterLink to="/flights" class="mr-4">Flights</RouterLink>
        <RouterLink to="/auth" class="mr-4">Auth</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin" class="mr-4">Admin</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin_aboutCompany" class="mr-4">AboutADMIN</RouterLink>

        <button v-if="isLoggedin" @click="logout">LogOut</button>

        <!-- RouterLink to products, Auth, Admin & and logout button -->

        <!-- toggle cart button -->

        <!-- Routerlink to orders -->
      </nav>
    </div>
  </header>

  <RouterView />

  <!-- CartBasket component -->
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { computed } from "vue";
import { useUsers } from "@/modules/auth/useUsers";
import { state } from "@/modules/globalStates/state";

const { logout } = useUsers();
const isLoggedin = computed(() => state.isLoggedIn);
const isAdmin = computed(() => state.isAdmin);
</script>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
