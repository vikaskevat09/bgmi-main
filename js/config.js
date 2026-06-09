/* ============================================================
   FRONTEND → BACKEND connection
   ------------------------------------------------------------
   - Leave BACKEND_URL empty for a frontend-only site: all assets
     (banners, logo, game covers) then load from THIS same domain,
     and API calls (orders/admin) simply no-op with graceful
     fallbacks until a backend exists.
   - When you deploy the Node backend (e.g. on Render), put its URL
     here, for example:
         var BACKEND_URL = 'https://your-backend.onrender.com';
     Then admin, login, orders and live ID verification turn on.
   ============================================================ */
(function () {
  var BACKEND_URL = ''; // <- set your backend URL here when you have one

  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  // Same-origin locally; otherwise use BACKEND_URL (empty = same-origin assets).
  window.TUZ_API_BASE = isLocal ? '' : BACKEND_URL;
})();
