import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/overview";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/overview')(ContentRoute(contentData));
