import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import nextPlugin from "@next/eslint-plugin-next"
import { fixupPluginRules } from "@eslint/compat"

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // --- KONFIGURASI KHUSUS APPS/WEB (Next.js) ---
  {
    files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
    plugins: {
      "@next/next": fixupPluginRules(nextPlugin),
    },
    settings: {
      next: {
        rootDir: "apps/web", // Memberitahu plugin lokasi folder app/pages
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // Matikan aturan ini jika Anda tidak menggunakan folder 'pages' (App Router)
      "@next/next/no-html-link-for-pages": "off", 
    },
  },

  // --- ATURAN GLOBAL ---
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_", // Mengizinkan variabel diawali underscore
      }],
      // Mengizinkan interface kosong jika memang diperlukan sebagai placeholder
      "@typescript-eslint/no-empty-object-type": "off", 
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
  },

  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },
])