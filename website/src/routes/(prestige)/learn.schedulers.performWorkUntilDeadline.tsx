import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/schedulers/performWorkUntilDeadline";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/schedulers/performWorkUntilDeadline')(ContentRoute(contentData));
