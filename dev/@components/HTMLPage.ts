import { signal } from "@cyftech/signal";
import { Child, component, m } from "@mufw/maya";

type HTMLPageProps = {
  cssClasses?: string;
  body: Child;
  onMount?: () => void;
  onUnMount?: () => void;
};

export const HTMLPage = component<HTMLPageProps>(
  ({ cssClasses, body, onMount, onUnMount }) => {
    const stylesheetLinkRel = signal<"preload" | "stylesheet">("stylesheet");

    return m.Html({
      lang: "en",
      children: [
        m.Head({
          onmount: () => (stylesheetLinkRel.value = "stylesheet"),
          children: [
            m.Meta({
              "http-equiv": "Content-Security-Policy",
              content: `
                default-src 'self';
                script-src 'self';
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
                font-src https://fonts.gstatic.com;
                object-src 'none';
                base-uri 'none';
              `,
            }),
            m.Meta({ charset: "UTF-8" }),
            m.Meta({ "http-equiv": "X-UA-Compatible", content: "IE=edge" }),
            m.Meta({
              name: "viewport",
              content: "width=device-width, initial-scale=1.0",
            }),
            m.Link({
              rel: "icon",
              type: "image/x-icon",
              href: "/assets/images/favicon.ico",
            }),
            m.Link({
              rel: stylesheetLinkRel,
              href: "/assets/styles.css",
              as: "style",
            }),
            m.Link({ rel: "manifest", href: "/manifest.json" }),
            m.Title("Habits (by Cyfer)"),
          ],
        }),
        m.Body({
          tabindex: "-1",
          class: cssClasses,
          onmount: onMount,
          onunmount: onUnMount,
          children: [m.Script({ src: "main.js", defer: true }), body],
        }),
      ],
    });
  }
);
