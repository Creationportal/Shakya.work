// Cloudflare Worker — VIP Gatekeeper for shakya.work/vip/
// Deployed via Cloudflare Dashboard → Workers & Pages → Create Worker

// The default password for /vip/ (without a code)
const DEFAULT_PASSWORD = "2026";

// Known valid codes and their passwords
// Format: { "code": "password" }
const VIP_CODES = {
  "88": "2026"  // /vip/88 uses the same password
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only intercept /vip/* routes
    if (!path.startsWith('/vip/')) {
      // Not a VIP route — pass through normally
      return fetch(request);
    }

    // Extract the code from the path: /vip/CODE or /vip/CODE/something
    const parts = path.split('/');
    const code = parts[2] || ''; // e.g., "88" from /vip/88

    // CASE 1: Direct code access — /vip/88
    if (code && VIP_CODES[code]) {
      // Rewrite the URL to serve the HTML page for this code
      // e.g., /vip/88 → /vip/88.html
      const vipUrl = new URL(url);
      vipUrl.pathname = `/vip/${code}.html`;
      return fetch(vipUrl.toString());
    }

    // CASE 2: Unknown code — redirect to password prompt
    // The HTML form at /vip/ will POST to the same page
    if (request.method === 'POST') {
      const formData = await request.formData();
      const enteredPassword = formData.get('password') || '';

      if (enteredPassword === DEFAULT_PASSWORD) {
        // Correct password — redirect to the default VIP page
        // For now, redirect to /vip/88 since that's the only valid code
        return Response.redirect(new URL('/vip/88', url), 302);
      } else {
        // Wrong password — show the login page with an error
        const loginPage = await fetch(new URL('/vip/index.html', url));
        let html = await loginPage.text();
        // Inject error message
        html = html.replace(
          'id="vipError" style="display: none;"',
          'id="vipError" style="display: block;"'
        );
        return new Response(html, {
          headers: { 'content-type': 'text/html' }
        });
      }
    }

    // CASE 3: GET request to /vip/ with no code or invalid code
    // If the path is exactly /vip/ or /vip, show the password form
    if (code === '' || !VIP_CODES[code]) {
      return fetch(new URL('/vip/index.html', url));
    }

    // Fallback: pass through
    return fetch(request);
  }
};