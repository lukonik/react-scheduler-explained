import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/prerequisites/event-loop";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/prerequisites/event-loop')(LazyContentRoute(contentData));
