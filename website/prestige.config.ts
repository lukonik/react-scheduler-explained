import { defineConfig } from "@lonik/prestige/vite";

export default defineConfig({
  title: "website",
  license: {
    label: "MIT",
    url: "https://opensource.org/licenses/MIT",
  },
  github: "https://github.com/lukonik/prestige",
  collections: [
    {
      id: "learn",
      items: [
        {
          label: "Showcase",
          slug: "learn/showcase",
        },
        {
          label: "Prerequisites",
          items: [
            {
              label: "Mini Heap",
              slug: "learn/prerequisites/mini-heap",
            },
          ],
        },
      ],
    },
  ],
});
