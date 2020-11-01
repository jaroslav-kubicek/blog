module.exports = {
  title: "My Site",
  tagline: "The tagline of my site",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  favicon: "img/favicon.ico",
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.
  themeConfig: {
    gtag: {
      trackingID: "G-ZVDDRND2W4",
    },
    navbar: {
      title: "Kubajz.dev",
      logo: {
        alt: "Kubajz",
        src: "img/avatar_small.png",
      },
      items: [
        // TODO add here tips from README repo
        // {
        //   to: 'docs/',
        //   activeBasePath: 'docs',
        //   label: 'Docs',
        //   position: 'left',
        // },
        { to: "/", label: "Blog", position: "left" },
        {
          href: "https://github.com/jaroslav-kubicek/blog",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Community",
          items: [
            {
              label: "Medium",
              href: "https://medium.com/@jaroslavkubicek",
            },
            {
              label: "GitHub",
              href: "https://github.com/jaroslav-kubicek/",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/kubajzHK",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Adeira Universe",
              href: "https://github.com/adeira/universe",
            },
            {
              label: "Relay Example",
              href: "https://relay-example.adeira.now.sh/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kubajz.dev, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/jaroslav-kubicek/blog/edit/master/",
        },
        blog: {
          feedOptions: {
            type: "all",
          },
          showReadingTime: true,
          routeBasePath: "/",
          editUrl: "https://github.com/jaroslav-kubicek/blog/edit/master/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
