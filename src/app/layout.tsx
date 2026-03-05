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

// Prevent stale prerendered HTML from being cached across deploys.
export const revalidate = 0

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Recover from stale chunks after deploy: force a cache-busting navigation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var key='__chunk_reload_count';
                var count=parseInt(sessionStorage.getItem(key)||'0',10);
                try{
                  var currentUrl=new URL(window.location.href);
                  if(currentUrl.searchParams.has('__chunkfix')){
                    currentUrl.searchParams.delete('__chunkfix');
                    history.replaceState(null,'',currentUrl.pathname+currentUrl.search+currentUrl.hash);
                    sessionStorage.removeItem(key);
                    count=0;
                  }
                }catch(_e){}
                function doReload(){
                  if(count<2){
                    sessionStorage.setItem(key,String(count+1));
                    try{
                      var url=new URL(window.location.href);
                      url.searchParams.set('__chunkfix',Date.now().toString());
                      window.location.replace(url.toString());
                    }catch(_e){
                      window.location.reload();
                    }
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
