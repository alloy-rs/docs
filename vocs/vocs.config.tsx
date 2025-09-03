import { defineConfig } from 'vocs'
import { sidebar } from './sidebar'
export default defineConfig({
  title: 'alloy',
  logoUrl: '/alloy-logo.png',
  sidebar,
  sponsors: [
    {
      name: 'Collaborator',
      height: 120,
      items: [
        [
          {
            name: 'Paradigm',
            link: 'https://paradigm.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/paradigm-light.svg',
          },
          {
            name: 'Ithaca',
            link: 'https://ithaca.xyz',
            image:
              'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/ithaca-light.svg',
          },
        ],
      ],
    }
  ],
  iconUrl: { light: '/favicon.png', dark: '/favicon.png' },
  head() {
    return (
      <>
        <meta name="twitter:card" content="summary"/>
        <meta property="og:title" content="Alloy Docs" />
        <meta property="og:description" content="Connect Applications to Blockchains" />
        <meta property="og:image" content="https://raw.githubusercontent.com/alloy-rs/book/master/vocs/docs/publics/banner.jpg" />
      </>
    )
  },
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
      text: '1.0.29',
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
    pattern: 'https://github.com/alloy-rs/docs/edit/main/vocs/docs/pages/:path',
    text: 'Suggest changes on GitHub',
  }
})
