import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/prerequisites/prerequisites";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/prerequisites/prerequisites')(ContentRoute(contentData));
