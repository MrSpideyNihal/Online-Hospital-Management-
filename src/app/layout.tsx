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
        {/* ──────────────────────────────────────────────────────────────────
            Stale-chunk recovery v4
            ─────────────────────────────────────────────────────────────────
            Two-layer defence against Netlify Durable Cache serving an old
            HTML shell after a new deploy:

            Layer 1 – Proactive build-ID check (runs on every page load):
              • Reads window.__NEXT_DATA__.buildId (baked into the HTML at
                build time by Next.js).
              • Fetches /api/build-id?_={random} (no-store, no-cache) to get
                the live build ID from the server.
              • If they differ → the browser has a stale HTML shell → reload.
              • Skips the check if we already reloaded within the last 10 s to
                prevent an infinite boot loop.

            Layer 2 – Reactive chunk-error handler (fires on any 404/MIME
            chunk load failure):
              • If the proactive check already fired for this navigation, skips
                to avoid double-reload.
              • Tries up to 4 times, then gives up and redirects to /.
        ──────────────────────────────────────────────────────────────────*/}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var KEY='__chunk_reload_v4';
                function loadState(){
                  try{return JSON.parse(sessionStorage.getItem(KEY))||{count:0,ts:0,checked:false};}
                  catch(_){return {count:0,ts:0,checked:false};}
                }
                function saveState(s){
                  try{sessionStorage.setItem(KEY,JSON.stringify(s));}catch(_){}
                }
                function clearState(){
                  try{sessionStorage.removeItem(KEY);}catch(_){}
                }
                function cleanParams(){
                  try{
                    var u=new URL(location.href);
                    var had=u.searchParams.has('__chunkfix')||u.searchParams.has('__chunkts')||u.searchParams.has('_rsc');
                    u.searchParams.delete('__chunkfix');u.searchParams.delete('__chunkts');u.searchParams.delete('_rsc');
                    if(had)history.replaceState(null,'',u.pathname+u.search+u.hash);
                  }catch(_){}
                }
                function resetCaches(){
                  try{if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(reg){try{reg.unregister();}catch(_){}});});}catch(_){}
                  try{if('caches' in window)caches.keys().then(function(keys){keys.forEach(function(k){try{caches.delete(k);}catch(_){}});});}catch(_){}
                }
                function hardReload(){
                  var s=loadState();
                  var now=Date.now();
                  if(s.ts&&now-s.ts<10000)return; // already reloaded < 10 s ago, stop
                  if(s.count>=4){clearState();location.replace('/');return;}
                  s.count+=1;s.ts=now;saveState(s);
                  resetCaches();
                  var u=new URL(location.href);
                  u.searchParams.set('__chunkfix',String(s.count));
                  u.searchParams.set('__chunkts',now.toString(36));
                  location.replace(u.pathname+u.search+u.hash);
                }
                function hasChunkMsg(m){
                  return /ChunkLoadError|Loading chunk|Loading CSS chunk|MIME type|Failed to fetch dynamically imported module/.test(m||'');
                }
                cleanParams();
                // Layer 1: proactive build-ID check
                (function(){
                  try{
                    var nd=window.__NEXT_DATA__;
                    if(!nd||!nd.buildId)return;
                    var pageBuildId=nd.buildId;
                    // Skip if we just reloaded < 15 s ago (avoid boot loop)
                    var s=loadState();
                    if(s.ts&&Date.now()-s.ts<15000)return;
                    fetch('/api/build-id?_='+Math.random(),{cache:'no-store',method:'GET'})
                      .then(function(r){return r.ok?r.json():null;})
                      .then(function(data){
                        if(data&&data.buildId&&data.buildId!==pageBuildId){
                          console.warn('[stale-shell] buildId mismatch: page='+pageBuildId+' server='+data.buildId+' → reloading');
                          hardReload();
                        }
                      })
                      .catch(function(){});
                  }catch(_){}
                })();
                // Layer 2: reactive chunk-error handler
                window.addEventListener('error',function(e){
                  if(hasChunkMsg(e.message||''))return hardReload();
                  var t=e.target;
                  if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')){
                    var u=t.src||t.href||'';
                    if(u.indexOf('/_next/')!==-1)hardReload();
                  }
                },true);
                window.addEventListener('unhandledrejection',function(e){
                  var r=e.reason||{};
                  if(r.name==='ChunkLoadError'||hasChunkMsg(r.message||''))hardReload();
                });
                window.addEventListener('pageshow',function(e){
                  if(e.persisted)hardReload();
                });
                // If stable for 10 s, clear retry state
                setTimeout(function(){clearState();cleanParams();},10000);
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
