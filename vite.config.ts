import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "hp-[dir]-[name]",
      inject: "body-last",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4000,
    allowedHosts: ['heropath.network', 'dev1.heropath.network', 'dev2.heropath.network', 'heropath.local'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  publicDir: 'public',
});
