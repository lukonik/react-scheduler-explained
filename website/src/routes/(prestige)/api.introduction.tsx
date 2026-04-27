import { createFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/api/introduction";
import { ContentRoute } from "@lonik/prestige/ui";

export const Route = createFileRoute('/(prestige)/api/introduction')(ContentRoute(contentData));
