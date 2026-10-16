// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Dev-only source injection adds data-tsd-source to every JSX element; React Three Fiber
// treats it as a three.js prop and crashes. Strip it from 3D game files.
const stripTsdSourceIn3D = {
  name: "strip-tsd-source-3d",
  enforce: "post" as const,
  transform(code: string, id: string) {
    if (!id.includes("/src/game/") || !code.includes("data-tsd-source")) return null;
    return { code: code.replace(/["']?data-tsd-source["']?\s*[:=]\s*"[^"]*",?/g, ""), map: null };
  },
};

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: { plugins: [stripTsdSourceIn3D] },
});
