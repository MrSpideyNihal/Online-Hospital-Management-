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
                var key='__chunk_reload_state_v3';
                function loadState(){
                  try{
                    var raw=sessionStorage.getItem(key);
                    if(!raw)return {count:0,ts:0};
                    var parsed=JSON.parse(raw);
                    return {count:Number(parsed.count)||0,ts:Number(parsed.ts)||0};
                  }catch(_e){
                    return {count:0,ts:0};
                  }
                }
                function saveState(state){
                  try{sessionStorage.setItem(key,JSON.stringify(state));}catch(_e){}
                }
                function clearState(){
                  try{sessionStorage.removeItem(key);}catch(_e){}
                }
                function cleanChunkFixParams(){
                  try{
                    var cleanUrl=new URL(window.location.href);
                    var hadFix=cleanUrl.searchParams.has('__chunkfix')||cleanUrl.searchParams.has('__chunkts')||cleanUrl.searchParams.has('_rsc');
                    cleanUrl.searchParams.delete('__chunkfix');
                    cleanUrl.searchParams.delete('__chunkts');
                    cleanUrl.searchParams.delete('_rsc');
                    if(hadFix){
                      history.replaceState(null,'',cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
                    }
                  }catch(_e){}
                }
                function resetCachesBestEffort(){
                  try{
                    if('serviceWorker' in navigator){
                      navigator.serviceWorker.getRegistrations().then(function(regs){
                        regs.forEach(function(reg){
                          try{reg.unregister();}catch(_e){}
                        });
                      });
                    }
                  }catch(_e){}
                  try{
                    if('caches' in window){
                      caches.keys().then(function(keys){
                        keys.forEach(function(k){
                          try{caches.delete(k);}catch(_e){}
                        });
                      });
                    }
                  }catch(_e){}
                }
                var state=loadState();
                var now=Date.now();
                if(!state.ts||now-state.ts>10*60*1000){
                  state={count:0,ts:now};
                  saveState(state);
                }
                cleanChunkFixParams();
                function doReload(){
                  if(state.count<4){
                    state.count+=1;
                    state.ts=Date.now();
                    saveState(state);
                    resetCachesBestEffort();
                    try{
                      var url=new URL(window.location.href);
                      // Force a fresh document/cache key when stale chunk URLs are referenced.
                      url.searchParams.set('__chunkfix',String(state.count));
                      url.searchParams.set('__chunkts',Date.now().toString(36));
                      url.searchParams.set('_rsc',Math.random().toString(36).slice(2));
                      window.location.replace(url.pathname+url.search+url.hash);
                    }catch(_e){
                      window.location.reload();
                    }
                  }else{
                    clearState();
                    window.location.replace('/');
                  }
                }
                function hasChunkMessage(msg){
                  return msg.indexOf('Loading chunk')!==-1
                    || msg.indexOf('ChunkLoadError')!==-1
                    || msg.indexOf('Loading CSS chunk')!==-1
                    || msg.indexOf('MIME type')!==-1
                    || msg.indexOf('Failed to fetch dynamically imported module')!==-1;
                }
                window.addEventListener('error',function(e){
                  var m=e.message||'';
                  if(hasChunkMessage(m))doReload();
                  var t=e.target;
                  if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')){
                    var u=t.src||t.href||'';
                    if(u.indexOf('/_next/')!==-1)doReload();
                  }
                },true);
                window.addEventListener('unhandledrejection',function(e){
                  var r=e.reason;
                  if(r&&(r.name==='ChunkLoadError'||(r.message&&hasChunkMessage(r.message))))doReload();
                });
                window.addEventListener('pageshow',function(e){
                  if(e.persisted)doReload();
                });
                // If the app stays stable for a few seconds, clear the retry state.
                setTimeout(function(){
                  clearState();
                  cleanChunkFixParams();
                },5000);
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
