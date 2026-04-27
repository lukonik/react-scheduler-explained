import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/source-code/schedulePerformWorkUntilDeadline";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/source-code/schedulePerformWorkUntilDeadline')(LazyContentRoute(contentData));
