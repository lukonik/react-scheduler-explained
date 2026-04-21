import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/showcase";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/showcase')(ContentRoute(contentData));
