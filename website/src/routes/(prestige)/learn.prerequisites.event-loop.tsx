import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/prerequisites/event-loop";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/prerequisites/event-loop')(ContentRoute(contentData));
