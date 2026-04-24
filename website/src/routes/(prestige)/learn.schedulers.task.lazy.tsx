import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/schedulers/task";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/schedulers/task')(LazyContentRoute(contentData));
