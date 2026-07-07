// Thin wrapper around gtag (loaded in index.html). Only the funnel moments
// that matter for the North Star Metric are tracked explicitly — sign_up
// and weekly_checkin_completed. Page views are handled automatically by
// GA4's default snippet.

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
