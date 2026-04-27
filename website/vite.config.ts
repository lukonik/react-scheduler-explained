import { prestige } from "@lonik/prestige/vite";
import { devtools } from "@tanstack/devtools-vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
const config = defineConfig({
  base: "/react-scheduler-explained/",
  optimizeDeps: {
    include: [
      "use-sync-external-store/shim",
      "use-sync-external-store/shim/with-selector",
    ],
  },
  plugins: [
    prestige(),
    devtools(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
      },
      sitemap: { enabled: true, host: "https://lukonik.github.io/react-scheduler-explained/" },
    }),
    viteReact(),
  ],
});

export default config;
