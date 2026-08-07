import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { SiteChrome } from '#/components/SiteChrome'
import { BRAND } from '#/lib/brand'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Securist — Permission for code and models',
      },
      {
        name: 'description',
        content: `${BRAND.tagline} ${BRAND.posture}`,
      },
      { name: 'theme-color', content: '#222222' },
      { name: 'robots', content: 'index,follow' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', href: BRAND.faviconPath },
      { rel: 'shortcut icon', type: 'image/png', href: BRAND.faviconPath },
      { rel: 'apple-touch-icon', href: BRAND.faviconPath },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
        <Scripts />
      </body>
    </html>
  )
}
