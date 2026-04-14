// Extend the global Window interface to type the dataLayer array pushed by GTM.
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

type EventParams = Record<string, string | number | boolean | null | undefined>

const isDev = import.meta.env.DEV

/**
 * Track a custom event.
 *
 * - In development: prints to console only, never touches GTM.
 * - In production: pushes to window.dataLayer which GTM reads.
 *
 * @param eventName  GA4-style snake_case event name (e.g. 'predictions_submit_success')
 * @param params     Optional key/value parameters sent alongside the event
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (isDev) {
    console.log('[GTM dev]', eventName, params ?? {})
    return
  }

  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({
    event: eventName,
    ...params,
  })
}
