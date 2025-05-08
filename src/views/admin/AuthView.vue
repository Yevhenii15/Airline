<template>
  <div class="auth-page">
    <LoginRegister :isVisible="isPopupVisible" @close="closePopup" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LoginRegister from "../../components/login/LoginRegister.vue"; // Your login/register popup component

const isPopupVisible = ref(true);

const closePopup = () => {
  isPopupVisible.value = false; // Close the popup when user logs in or registers
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
