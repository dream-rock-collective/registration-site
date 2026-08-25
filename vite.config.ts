import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        registered: "registered/index.html",
        success: "success/index.html",
        allocatePayment: "allocate-payment/index.html",
      },
    },
  },
});
