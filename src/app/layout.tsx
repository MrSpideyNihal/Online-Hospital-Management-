import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "DentalHub – Find the Best Dental Hospital Near You",
  description: "Multi-tenant dental hospital and clinic management system. Search, book appointments, and manage your dental health.",
  keywords: ["dental", "hospital", "clinic", "dentist", "appointment", "dental care"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Recover from stale chunks after deploy: reload once to get fresh HTML */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var reloaded = sessionStorage.getItem('chunk-reload');
                window.addEventListener('error', function(e){
                  if(
                    e.message && (
                      e.message.indexOf('Loading chunk') !== -1 ||
                      e.message.indexOf('ChunkLoadError') !== -1 ||
                      e.message.indexOf('Loading CSS chunk') !== -1
                    ) && !reloaded
                  ){
                    sessionStorage.setItem('chunk-reload','1');
                    window.location.reload();
                  }
                });
                if(reloaded) sessionStorage.removeItem('chunk-reload');
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
