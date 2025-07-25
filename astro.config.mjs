import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import icon from "astro-icon"

// https://astro.build/config
export default defineConfig({
  site: "https://astro-sphere-demo.vercel.app",
  output: "hybrid",
  integrations: [
    mdx(), 
    sitemap(), 
    solidJs(), 
    tailwind({ applyBaseStyles: false }),
    icon()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      transformers: [],
      langs: [
        'javascript',
        'typescript',
        'html',
        'css',
        'json',
        'bash',
        'shell',
        'text',
        'astro'
      ]
    }
  }
})