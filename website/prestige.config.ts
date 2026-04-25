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
            {
              label: "Mini Heap",
              slug: "learn/prerequisites/mini-heap",
            },
          ],
        },
        {
          label: "Scheduler",
          items: [
            {
              label: "Scheduler",
              slug: "learn/schedulers/scheduler",
            },
            {
              label: "Queues",
              slug: "learn/schedulers/queues",
            },
            {
              label: "Task",
              slug: "learn/schedulers/task",
            },
            {
              label: "Browser Work",
              slug: "learn/schedulers/browser-work",
            },
            {
              label: "Scheduler Intro",
              slug: "learn/schedulers/scheduler-intro",
            },
            {
              label: "scheduleCallback",
              slug: "learn/schedulers/scheduleCallback",
            },
            {
              label: "workLoop",
              slug: "learn/schedulers/workLoop",
            },
            {
              label: "requestHostCallback",
              slug: "learn/schedulers/requestHostCallback",
            },
            {
              label: "schedulePerformWorkUntilDeadline",
              slug: "learn/schedulers/schedulePerformWorkUntilDeadline",
            },
            {
              label: "performWorkUntilDeadline",
              slug: "learn/schedulers/performWorkUntilDeadline",
            },
            {
              label: "flushWork",
              slug: "learn/schedulers/flushWork",
            },
          ],
        },
      ],
    },
  ],
});
