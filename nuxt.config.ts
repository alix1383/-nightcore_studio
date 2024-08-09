// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
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