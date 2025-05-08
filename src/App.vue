<template>
  <div class="app-container">
    <header class="navbar">
      <div class="nav-wrapper">
        <RouterLink to="/" class="nav-logo">
          <h1>FlyEAZY</h1>
        </RouterLink>
        <nav class="nav-links">
          <RouterLink v-if="isLoggedIn" to="/profile" class="nav-item">
            Profile
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" class="nav-item">
            Admin Panel
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin_airports" class="nav-item">
            Airports
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin_routes" class="nav-item">
            Routes
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin_flights" class="nav-item">
            Flights
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin_bookings" class="nav-item">
            Bookings
          </RouterLink>
          <RouterLink v-if="isAdmin" to="/admin_aboutCompany" class="nav-item">
            About
          </RouterLink>
          <button v-if="isLoggedIn" @click="logout" class="nav-button">
            LogOut
          </button>
          <!-- Trigger the Login/Register popup -->
          <button
            v-if="!isLoggedIn"
            @click="openLoginRegisterPopup"
            class="nav-button"
          >
            Login / Register
          </button>
        </nav>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <!-- LoginRegister modal -->
    <LoginRegister
      :isVisible="isLoginRegisterVisible"
      @close="closeLoginRegisterPopup"
    />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from "vue-router";
import { ref, toRefs } from "vue";
import { useUsers } from "./modules/auth/useUsers";
import { state } from "./modules/globalStates/state";
import LoginRegister from "./components/login/LoginRegister.vue";

// Extract reactivity properly from state
const { isLoggedIn, isAdmin } = toRefs(state);
const { logout } = useUsers();

// Popup control
const isLoginRegisterVisible = ref(false);

const openLoginRegisterPopup = () => {
  isLoginRegisterVisible.value = true;
};

const closeLoginRegisterPopup = () => {
  isLoginRegisterVisible.value = false;
};
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
