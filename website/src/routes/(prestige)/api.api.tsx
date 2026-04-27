import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/api/api";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/api/api')(ContentRoute(contentData));
