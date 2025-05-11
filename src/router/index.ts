import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { state } from "../modules/globalStates/state";
import { watch } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/bookings",
      name: "bookings",
      component: () => import("../views/BookingView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/booking-confirmation",
      name: "BookingConfirmation",
      component: () => import("../views/BookingConfirmation.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/checkin",
      name: "checkin",
      component: () => import("../views/CheckInView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/tickets",
      name: "tickets",
      component: () => import("../views/TicketView.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/admin/AuthView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/admin/AdminView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_routes",
      name: "admin_routes",
      component: () => import("../views/admin/AdminRoutesView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_airports",
      name: "admin_airports",
      component: () => import("../views/admin/AdminAirportsView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_flights",
      name: "admin_flights",
      component: () => import("../views/admin/AdminFlightsView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_bookings",
      name: "admin_bookings",
      component: () => import("../views/admin/AdminBookingView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_booked_seats",
      name: "admin_booked_seats",
      component: () => import("../views/admin/AdminBookedSeatsView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: "/admin_aboutCompany",
      name: "admin_aboutCompany",
      component: () => import("../views/admin/AdminAboutCompanyView.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = state.isLoggedIn;
  const isAdmin = state.isAdmin;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  // 🔹 Prevent normal users from accessing admin routes
  if (requiresAdmin && (!isAuthenticated || !isAdmin)) {
    next("/auth");
  }
  // 🔹 Prevent guests from accessing authenticated routes
  else if (requiresAuth && !isAuthenticated) {
    next("/auth");
  }
  // ✅ Allow access
  else {
    next();
  }
});
watch(
  () => [state.isLoggedIn, state.isAdmin],
  ([isLoggedIn, isAdmin]) => {
    const currentRoute = router.currentRoute.value;

    const requiresAuth = currentRoute.meta.requiresAuth;
    const requiresAdmin = currentRoute.meta.requiresAdmin;

    if (requiresAdmin && (!isLoggedIn || !isAdmin)) {
      router.push("/auth");
    } else if (requiresAuth && !isLoggedIn) {
      router.push("/auth");
    }
  }
);

export default router;
