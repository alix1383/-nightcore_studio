// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      title: "NightCore Studio",
      htmlAttrs: {
        lang: "en"
      },
      meta: [
        { name: 'description', content: 'simple web app let u convert music to NightCore' }
      ],
    }
  },

  ssr: false,

  $development: {
    devtools: { enabled: true },
  },

  i18n: {
    defaultLocale: 'en',
    langDir: './lang',
    locales: [{ code: 'en', file: 'en.json' }]

  },
  googleFonts: {
    families: {
      Zeyada: true,
    }
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
    "@nuxt/image",
    "@nuxtjs/google-fonts"
  ]
})