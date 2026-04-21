import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/prerequisites/mini-heap";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/prerequisites/mini-heap')(LazyContentRoute(contentData));
