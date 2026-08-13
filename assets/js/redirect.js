// _path redirect handler — externalized so it is permitted by the meta CSP
// (script-src 'self'). Reads ?_path=... from the URL and rewrites history so
// the SPA router (app.js) can render the intended deep-linked route.
(function () {
  var params = new URLSearchParams(window.location.search);
  var redirect = params.get('_path');
  if (redirect) {
    redirect = redirect.replace(/\/+$/, '');
    history.replaceState(null, '', redirect);
  }
})();
