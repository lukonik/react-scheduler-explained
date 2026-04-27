import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/api/api";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/api/api')(LazyContentRoute(contentData));
