<template>
  <div class="home-container">
    <header class="hero">
      <h1 class="hero-title">Welcome to FlyEAZY</h1>
      <p class="hero-subtitle">Your journey begins here</p>
      <router-link to="/flights" class="btn-primary">Book a Flight</router-link>
    </header>
    
    <div class="info-sections">
      <router-link to="/about" class="info-card">
        <h2>About Us</h2>
        <p>Learn more about our airline and our story.</p>
      </router-link>
      <router-link to="/flights" class="info-card">
        <h2>Flights</h2>
        <p>Check available flights and book your tickets.</p>
      </router-link>
      <router-link to="/auth" class="info-card">
        <h2>Authentication</h2>
        <p>Login or manage your airline services.</p>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watchEffect } from "vue";
import { useCompany } from "../modules/useCompany";

export default {
  name: "HomeView",
  setup() {
    const { aboutCompany, fetchAboutInfo } = useCompany();
    const companyData = ref({ name: "Loading..." });

    onMounted(async () => {
      await fetchAboutInfo();
    });

    watchEffect(() => {
      if (aboutCompany.value) {
        companyData.value = { ...aboutCompany.value };
      }
    });

    return { companyData };
  },
};
</script>

<style scoped>
.home-container {
  text-align: center;
  padding: 20px;
  background: url('/assets/beautiful-sky.jpg') center/cover no-repeat;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}
.hero {
  background: rgba(0, 0, 0, 0.6);
  padding: 80px 20px;
  border-radius: 12px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
}
.hero-title {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 10px;
}
.hero-subtitle {
  font-size: 20px;
  margin-bottom: 20px;
}
.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: #ff7f50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: 0.3s;
  font-size: 18px;
  font-weight: bold;
}
.btn-primary:hover {
  background: #ff4500;
}
.info-sections {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 50px;
  gap: 20px;
}
.info-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-decoration: none;
  color: #333;
  font-size: 20px;
  width: 280px;
  transition: 0.3s;
  text-align: center;
  font-weight: bold;
}
.info-card:hover {
  background: #007bff;
  color: white;
  transform: scale(1.05);
}
</style>