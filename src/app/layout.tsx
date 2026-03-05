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
                var key='__chunk_reload';
                var reloaded=sessionStorage.getItem(key);
                function doReload(){
                  if(!reloaded){
                    sessionStorage.setItem(key,'1');
                    window.location.reload();
                  }
                }
                window.addEventListener('error',function(e){
                  var m=e.message||'';
                  if(m.indexOf('Loading chunk')!==-1||m.indexOf('ChunkLoadError')!==-1||m.indexOf('Loading CSS chunk')!==-1||m.indexOf('MIME type')!==-1)doReload();
                  var t=e.target;
                  if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')){
                    var u=t.src||t.href||'';
                    if(u.indexOf('/_next/')!==-1)doReload();
                  }
                },true);
                window.addEventListener('unhandledrejection',function(e){
                  var r=e.reason;
                  if(r&&(r.name==='ChunkLoadError'||(r.message&&(r.message.indexOf('Loading chunk')!==-1||r.message.indexOf('Failed to fetch')!==-1))))doReload();
                });
                if(reloaded)sessionStorage.removeItem(key);
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
