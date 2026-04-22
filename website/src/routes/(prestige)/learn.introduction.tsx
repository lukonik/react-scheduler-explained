import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/introduction";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/learn/introduction')(ContentRoute(contentData));
