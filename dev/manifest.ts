import { WebAppManifest } from "web-app-manifest";

const assetsPath = "/assets";
const manifestImagesPath = `${assetsPath}/images/manifest-only`;

const manifest: WebAppManifest = {
  short_name: "Habits",
  name: "Habits (by Cyfer)",
  icons: [
    {
      src: `${manifestImagesPath}/192_logo.png`,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: `${manifestImagesPath}/512_logo.png`,
      sizes: "512x512",
      type: "image/png",
    },
  ],
  screenshots: [
    {
      src: `${manifestImagesPath}/screenshot1.png`,
      sizes: "640x320",
      type: "image/png",
    },
    {
      src: `${manifestImagesPath}/screenshot2.png`,
      sizes: "640x320",
      type: "image/png",
    },
    {
      src: `${manifestImagesPath}/screenshot3.png`,
      sizes: "640x320",
      type: "image/png",
    },
  ],
  start_url: "/index.html",
  id: "/index.html",
  display: "standalone",
  orientation: "portrait",
  theme_color: "#e87b52",
  background_color: "#fff0eb",
};

export default manifest;
