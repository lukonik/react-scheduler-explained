import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/source-code/flushWork";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/source-code/flushWork')(ContentRoute(contentData));
