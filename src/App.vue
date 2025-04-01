<template>
  <div class="app-container">
    <header class="navbar">
      <div class="nav-wrapper">
        <!-- Wrap the logo with RouterLink to navigate to home -->
        <RouterLink to="/" class="nav-logo">
          <h1>FlyEAZY</h1>
        </RouterLink>
        <nav class="nav-links">
          <RouterLink to="/about" class="nav-item">About</RouterLink>
          <RouterLink to="/flights" class="nav-item">Flights</RouterLink>
          <RouterLink to="/auth" class="nav-item">Auth</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" class="nav-item">Admin Panel</RouterLink>
          <button v-if="isLoggedin" @click="logout" class="nav-button">LogOut</button>
        </nav>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from "vue-router";
import { computed } from "vue";
import { useUsers } from "@/modules/auth/useUsers";
import { state } from "@/modules/globalStates/state";


const { logout } = useUsers();
const isLoggedin = computed(() => state.isLoggedIn);
const isAdmin = computed(() => state.isAdmin);


</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 0;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
}

.nav-wrapper {
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff7f50;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: 0.3s;
}

.nav-item:hover {
  color: #ff7f50;
}

.nav-button {
  background: #ff7f50;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.nav-button:hover {
  background: #ff4500;
}

.content {
  padding-top: 80px; /* Adjusted to prevent navbar overlap */
  flex: 1;
}
</style>