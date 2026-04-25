import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/schedulers/schedulePerformWorkUntilDeadline";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/schedulers/schedulePerformWorkUntilDeadline')(ContentRoute(contentData));
