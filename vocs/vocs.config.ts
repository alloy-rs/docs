import { defineConfig } from 'vocs/config'
import { sidebar } from './sidebar'
import { versions } from './versions'

export default defineConfig({
  title: 'Alloy',
  description: 'Alloy is a high-performance Rust toolkit for Ethereum and EVM-compatible chains.',
  baseUrl: 'https://alloy.rs',
  logoUrl: '/alloy-logo.png',
  renderStrategy: 'full-static',
  srcDir: 'docs',
  sidebar,
  iconUrl: { light: '/favicon.png', dark: '/favicon.png' },
  ogImageUrl: 'https://alloy.rs/banner.jpg',
  socials: [
    { icon: 'github', link: "https://github.com/alloy-rs/alloy" },
  ],
  topNav: [
    { 
      text: 'Docs',
      link: '/introduction/getting-started',
    },
    {
      text: 'Examples',
      link: 'https://github.com/alloy-rs/examples',
    },
    {
      text: 'docs.rs',
      link: 'https://docs.rs/alloy/latest/alloy/',
    },
    { 
      text: versions.alloy,
      items: [ 
        { 
          text: 'Changelog', 
          link: 'https://github.com/alloy-rs/alloy/blob/main/CHANGELOG.md', 
        }, 
        { 
          text: 'Contributing', 
          link: 'https://github.com/alloy-rs/alloy/blob/main/CONTRIBUTING.md', 
        }, 
      ], 
    }, 
  ],
  editLink: {
    link: 'https://github.com/alloy-rs/docs/edit/main/vocs/docs/pages/:path',
    text: 'Suggest changes on GitHub',
  }
})
