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
          label: "Introduction",
          slug: "learn/introduction",
        },
        {
          label: "Prerequisites",
          items: [
            {
              label: "Prerequisites",
              slug: "learn/prerequisites/prerequisites",
            },
            {
              label: "Event Loop",
              slug: "learn/prerequisites/event-loop",
            },
          ],
        },
      ],
    },
  ],
});
