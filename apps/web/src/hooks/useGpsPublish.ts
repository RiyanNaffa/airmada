/**
 * Hook: useGpsPublish
 *
 * Publishes driver's current location to the backend every `interval` ms
 * Should be called in a driver's layout or main component
 *
 * @location apps/web/src/hooks/useGpsPublish.ts
 *
 * Usage:
 *   useGpsPublish({
 *     interval: 10000,  // publish every 10 seconds
 *     onError: (err) => console.error(err)
 *   })
 */
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseGpsPublishOptions {
  /**
   * Interval in milliseconds to publish GPS coordinates
   * @default 15000 (15 seconds)
   */
  interval?: number
  /**
   * Enable/disable GPS publishing
   * @default true
   */
  enabled?: boolean
  /**
   * Callback when there's an error
   */
  onError?: (error: Error) => void
  /**
   * Callback when location is successfully published
   */
  onSuccess?: (location: { lat: number; lng: number }) => void
}

export function useGpsPublish(options: UseGpsPublishOptions = {}) {
  const { interval = 5000, enabled = true, onError, onSuccess } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPublishingRef = useRef(false)

  const publishLocation = useCallback(async () => {
    if (isPublishingRef.current) return // Prevent concurrent requests

    try {
      isPublishingRef.current = true

      // Get current geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (geoError) => {
            const errorMessages: Record<number, string> = {
              1: 'Permission denied. Please enable location access in your browser settings.',
              2: 'Position unavailable. Unable to retrieve your current location.',
              3: 'Request timeout. GPS location took too long to retrieve.',
            }
            const message =
              errorMessages[geoError.code] ||
              `Geolocation error: ${geoError.message || geoError.code}`
            reject(new Error(message))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        )
      })

      const { latitude, longitude, speed, heading } = position.coords

      // Get auth token from sessionStorage (custom auth system)
      let accessToken: string | null = null
      try {
        const sessionData = sessionStorage.getItem('user_session')
        if (sessionData) {
          const session = JSON.parse(sessionData)
          accessToken = session.access_token
        }
      } catch (error) {
        console.warn('Failed to parse session data:', error)
      }

      if (!accessToken) {
        throw new Error('Not authenticated - no session token found')
      }

      // Send to backend
      const response = await fetch('/api/gps/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          speed_kmh: speed ? Math.round(speed * 3.6) : 0, // Convert m/s to km/h
          heading: heading || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish GPS location')
      }

      onSuccess?.({ lat: latitude, lng: longitude })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      onError?.(err)
    } finally {
      isPublishingRef.current = false
    }
  }, [onError, onSuccess])

  useEffect(() => {
    if (!enabled) {
      // Clean up any existing interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Publish immediately on mount (if enabled)
    publishLocation()

    // Then publish at regular intervals
    intervalRef.current = setInterval(publishLocation, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [publishLocation, interval, enabled])

  return { publishLocation }
}
