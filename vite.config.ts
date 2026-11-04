import { defineConfig } from "vite";
import content from "./content/initial-page.json" with { type: "json" };
import { renderPage } from "./src/render-page.ts";

export default defineConfig({
  plugins: [
    {
      name: "initial-page-content",
      transformIndexHtml(html, context) {
        const page = context.filename.endsWith("/registered/index.html")
          ? "subscriptions"
          : context.filename.endsWith("/allocate-payment/index.html")
            ? "donations"
            : context.filename.endsWith("/success/index.html")
              ? "success"
              : "main";
        return html.replace(
          page === "main" ? "<!-- initial-page -->" : "<!-- editable-page -->",
          () => renderPage(content, page),
        );
      },
    },
  ],
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
