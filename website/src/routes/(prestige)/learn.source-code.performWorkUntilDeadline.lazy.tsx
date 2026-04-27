import { createLazyFileRoute } from "@tanstack/react-router";
import * as contentData from "virtual:prestige/content/learn/source-code/performWorkUntilDeadline";
import { LazyContentRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn/source-code/performWorkUntilDeadline')(LazyContentRoute(contentData));
