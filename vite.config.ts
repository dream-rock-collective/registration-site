import { defineConfig } from "vite";
import content from "./content/initial-page.json" with { type: "json" };
import {
  renderInitialHead,
  renderInitialPage,
} from "./src/render-initial-page.ts";

export default defineConfig({
  plugins: [
    {
      name: "initial-page-content",
      transformIndexHtml(html, context) {
        if (
          !context.filename.endsWith("/index.html") ||
          context.path !== "/index.html"
        )
          return html;
        return html
          .replace("<!-- initial-head -->", () => renderInitialHead(content))
          .replace("<!-- initial-page -->", () => renderInitialPage(content));
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
