// Cloudflare Worker entry point
// Serves static assets and adds cache-control headers for files that must
// never be cached at the edge so browsers always pick up new deployments.

export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url)
    const response = await env.ASSETS.fetch(request)

    // sw.js and index.html must never be cached — browsers and CDN must
    // always re-fetch them so a new deployment is detected immediately.
    const noCache = ['/sw.js', '/index.html', '/'].some(p => url.pathname === p)
    if (noCache) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      headers.set('Pragma', 'no-cache')
      return new Response(response.body, { status: response.status, headers })
    }

    return response
  },
}
