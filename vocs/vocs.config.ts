import { defineConfig } from 'vocs/config'
import { sidebar } from './sidebar'
export default defineConfig({
  title: 'alloy',
  logoUrl: '/alloy-logo.png',
  renderStrategy: 'full-static',
  srcDir: 'docs',
  sidebar,
  iconUrl: { light: '/favicon.png', dark: '/favicon.png' },
  ogImageUrl: 'https://raw.githubusercontent.com/alloy-rs/book/master/vocs/docs/publics/banner.jpg',
  socials: [
    { icon: 'github', link: "https://github.com/alloy-rs/alloy" },
    { icon: 'telegram', link: "https://t.me/ethers_rs" },
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
      text: '2.0.5',
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
