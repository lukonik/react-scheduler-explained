import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/theory/task";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/theory/task')(ContentRoute(contentData));
