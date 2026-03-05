/* Fallback for stale HTML shells requesting deleted Next.js chunks. */
(function () {
  try {
    if (window.__chunkFallbackReloaded) return;
    window.__chunkFallbackReloaded = true;

    console.error('[chunk-fallback] Missing chunk requested. Forcing hard reload.');

    var url = new URL(window.location.href);
    url.searchParams.set('__chunkfix', Date.now().toString(36));
    url.searchParams.set('__chunkts', Date.now().toString(36));

    window.location.replace(url.pathname + url.search + url.hash);
  } catch (_e) {
    window.location.reload();
  }
})();
