import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/api/introduction";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/api/introduction')(LazyContentRoute(contentData));
