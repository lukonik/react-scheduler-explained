import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/schedulers/schedulePerformWorkUntilDeadline";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/schedulers/schedulePerformWorkUntilDeadline')(LazyContentRoute(contentData));
