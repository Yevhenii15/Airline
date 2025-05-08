<template>
  <body class="flex items-center justify-center">
    <div
      class="p-6 bg-black w-[90%] rounded-2xl shadow-lg border border-[#ff7f50]"
    >
      <h1 class="text-4xl text-center text-orange-500 mb-8 font-bold">
        Admin Panel
      </h1>
      <div
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center"
      >
        <router-link
          v-for="route in adminRoutes"
          :key="route.name"
          :to="route.path"
          class="w-full p-6 rounded-2xl bg-[#181818] shadow-lg border border-[#ff7f50] transition-transform hover:scale-[1.01]"
        >
          <h2 class="text-xl font-semibold text-white mb-3">
            {{ route.label }}
          </h2>
          <p class="text-sm text-gray-400">{{ route.description }}</p>
        </router-link>
      </div>
    </div>
  </body>
</template>

<script>
export default {
  data() {
    return {
      adminRoutes: [
        {
          path: "/admin_airports",
          name: "admin_airports",
          label: "Manage Airports",
          description:
            "Add, modify, and remove airport information and locations.",
        },
        {
          path: "/admin_routes",
          name: "admin_routes",
          label: "Manage Routes",
          description:
            "Create, update, and manage flight routes between airports.",
        },
        {
          path: "/admin_flights",
          name: "admin_flights",
          label: "Manage Flights",
          description:
            "Control flight schedules, prices, and availability for routes.",
        },
        {
          path: "/admin_bookings",
          name: "admin_bookings",
          label: "Manage Bookings",
          description:
            "View, edit, and manage customer bookings and flight reservations.",
        },
        {
          path: "/admin_aboutCompany",
          name: "admin_aboutCompany",
          label: "About Company",
          description:
            "Update and display information about the airline company, including mission and values.",
        },
      ],
    };
  },
};
</script>
