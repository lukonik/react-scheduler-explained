import { createLazyFileRoute } from '@tanstack/react-router';
import sidebar from "virtual:prestige/sidebar/learn";
import { CollectionRoute } from "@lonik/prestige/ui";

export const Route = createLazyFileRoute('/(prestige)/learn')(CollectionRoute(sidebar, "learn"));
