'use client'

import { useEffect } from 'react'

const GA_MEASUREMENT_ID = 'G-X13B7WS1E9'

/**
 * Honors the Global Privacy Control (GPC) browser signal by disabling
 * Google Analytics data collection. Checks navigator.globalPrivacyControl
 * on every page load — no persistent state.
 *
 * Must render before GA scripts execute (afterInteractive).
 */
export default function GpcGuard() {
  useEffect(() => {
    if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true
    }
  }, [])

  return null
}
