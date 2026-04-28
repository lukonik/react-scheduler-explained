import type { PrestigeShellProps } from "@lonik/prestige/ui";
import { PrestigeShell } from "@lonik/prestige/ui";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import config from "virtual:prestige/config";
import appCss from "../styles.css?url";

const siteUrl = "https://lukonik.github.io/react-scheduler-explained";
const socialImage = `${siteUrl}/images/logo.png`;

const options: PrestigeShellProps = {
  copyright: () => (
    <a
      className="underline"
      href="https://github.com/lukonik/Prestige"
      target="_blank"
      rel="norefferer"
    >
      Built with Prestige 🎩
    </a>
  ),
  afterHeaderLinks: [
    {
      label: "Showcase",
      to: "/showcase",
    },
  ],
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: config.title },
      {
        name: "description",
        content: "Learn how React's internal Scheduler works, from core concepts to source code.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: config.title },
      {
        property: "og:description",
        content: "Learn how React's internal Scheduler works, from core concepts to source code.",
      },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: socialImage },
      { property: "og:image:width", content: "1254" },
      { property: "og:image:height", content: "1254" },
      { property: "og:image:alt", content: "React Scheduler logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.title },
      {
        name: "twitter:description",
        content: "Learn how React's internal Scheduler works, from core concepts to source code.",
      },
      { name: "twitter:image", content: socialImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PrestigeShell options={options}>
          <Outlet />
        </PrestigeShell>
        <Scripts />
      </body>
    </html>
  ),
});
