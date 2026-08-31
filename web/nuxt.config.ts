// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    t2sApiBase: process.env.NUXT_T2S_API_BASE || "http://127.0.0.1:5000",
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://ikawe.ink",
    },
  },
  $production: {
    runtimeConfig: {
      t2sApiBase: process.env.NUXT_T2S_API_BASE || "https://api.outtloud.com",
    },
  },

  app: {
    head: {
      title: "Ikawe",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
          sizes: "48x48",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
      ],
      meta: [
        {
          name: "description",
          content:
            "Upload books and read them in a calm e-ink inspired reader with paper-like typography and themes.",
        },
      ],
    },
  },
});
