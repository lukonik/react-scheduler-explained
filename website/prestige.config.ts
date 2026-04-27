import { defineConfig } from "@lonik/prestige/vite";

export default defineConfig({
  title: "React Scheduler",
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
          label: "Overview",
          slug: "learn/overview",
        },
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
            {
              label: "Mini Heap",
              slug: "learn/prerequisites/mini-heap",
            },
          ],
        },
        {
          label: "Theory",
          items: [
            {
              label: "Theory",
              slug: "learn/theory/theory",
            },
            {
              label: "Queues",
              slug: "learn/theory/queues",
            },
            {
              label: "Task",
              slug: "learn/theory/task",
            },
            {
              label: "Browser Work",
              slug: "learn/theory/browser-work",
            },
            {
              label: "Scheduler",
              slug: "learn/theory/scheduler",
            },
          ],
        },
        {
          label: "Source Code",
          items: [
            {
              label: "Scheduler Intro",
              slug: "learn/source-code/scheduler-intro",
            },
            {
              label: "scheduleCallback",
              slug: "learn/source-code/scheduleCallback",
            },
            {
              label: "workLoop",
              slug: "learn/source-code/workLoop",
            },
            {
              label: "requestHostCallback",
              slug: "learn/source-code/requestHostCallback",
            },
            {
              label: "schedulePerformWorkUntilDeadline",
              slug: "learn/source-code/schedulePerformWorkUntilDeadline",
            },
            {
              label: "performWorkUntilDeadline",
              slug: "learn/source-code/performWorkUntilDeadline",
            },
            {
              label: "flushWork",
              slug: "learn/source-code/flushWork",
            },
          ],
        },
      ],
    },
    {
      id: "api",
      label: "API",
      items: [
        {
          label: "Introduction",
          slug: "api/introduction",
        },
        {
          label: "API",
          slug: "api/api",
        },
      ],
    },
  ],
});
