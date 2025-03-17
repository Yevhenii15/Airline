import { reactive, watch } from "vue";

const isLoggedInFromStorage = localStorage.getItem("isLoggedIn") === "true";
const isAdminFromStorage = localStorage.getItem("isAdmin") === "true";

export const state = reactive({
  isLoggedIn: isLoggedInFromStorage,
  isAdmin: isAdminFromStorage,
});

watch(
  () => state.isLoggedIn,
  (newValue) => {
    localStorage.setItem("isLoggedIn", String(newValue));
  }
);

watch(
  () => state.isAdmin,
  (newValue) => {
    localStorage.setItem("isAdmin", String(newValue));
  }
);
