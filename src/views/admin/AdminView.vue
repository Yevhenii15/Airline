<template>
  <div class="admin-container">
    <h1 class="title">Admin Panel</h1>
    <div class="admin-grid">
      <router-link
        v-for="route in adminRoutes"
        :key="route.name"
        :to="route.path"
        class="admin-card"
      >
        <h2>{{ route.label }}</h2>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      adminRoutes: [
        { path: "/admin_routes", name: "admin_routes", label: "Manage Routes" },
        {
          path: "/admin_airports",
          name: "admin_airports",
          label: "Manage Airports",
        },
        {
          path: "/admin_flights",
          name: "admin_flights",
          label: "Manage Flights",
        },
        {
          path: "/admin_bookings",
          name: "admin_bookings",
          label: "Manage Bookings",
        },
        {
          path: "/admin_aboutCompany",
          name: "admin_aboutCompany",
          label: "About Company",
        },
      ],
    };
  },
};
</script>

<style scoped>
.admin-container {
  text-align: center;
  padding: 20px;
}
.title {
  font-size: 24px;
  color: #ff7f50;
  margin-bottom: 20px;
}
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.admin-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #333;
  font-size: 18px;
  transition: 0.3s;
}
.admin-card:hover {
  background: #ff7f50;
  color: white;
}
</style>
