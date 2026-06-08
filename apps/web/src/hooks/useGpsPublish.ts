/**
 * Hook: useGpsPublish
 *
 * Automatically tracks and publishes driver's current location using native OS watchPosition.
 * Prevents interval throttling on mobile background tasks.
 *
 * @location apps/web/src/hooks/useGpsPublish.ts
 */
'use client'

import { useEffect, useRef } from 'react'

interface UseGpsPublishOptions {
  /**
   * Batas waktu minimal antar request ke backend (ms)
   * Untuk mencegah banjir request jika GPS bergerak terlalu cepat
   * @default 5000 (5 detik)
   */
  interval?: number
  /**
   * Enable/disable GPS publishing
   * @default true
   */
  enabled?: boolean
  /**
   * Callback ketika terjadi error sensor/auth
   */
  onError?: (error: Error) => void
  /**
   * Callback ketika koordinat sukses tersimpan di database
   */
  onSuccess?: (location: { lat: number; lng: number }) => void
}

export function useGpsPublish(options: UseGpsPublishOptions = {}) {
  const { interval = 5000, enabled = true, onError, onSuccess } = options
  const watchIdRef = useRef<number | null>(null)
  const lastSentTimeRef = useRef<number>(0)
  const isPublishingRef = useRef(false)

  useEffect(() => {
    // Jika dimatikan (bukan DRIVER), bersihkan listener pelacakan OS
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    if (!navigator.geolocation) {
      onError?.(new Error('Geolocation tidak didukung oleh browser ini.'))
      return
    }

    // Handler internal yang dipicu otomatis oleh sensor OS saat koordinat HP bergeser
    const handlePositionChange = async (position: GeolocationPosition) => {
      const now = Date.now()

      // Trik throttling: Hanya kirim ke server jika jeda waktu 'interval' terpenuhi (misal 5 atau 15 detik)
      if (now - lastSentTimeRef.current < interval) return
      if (isPublishingRef.current) return // Cegah tumpang tindih request berlebih

      try {
        isPublishingRef.current = true
        const { latitude, longitude, speed, heading } = position.coords

        // Ambil token otentikasi dari sessionStorage
        let accessToken: string | null = null
        try {
          const sessionData = sessionStorage.getItem('user_session')
          if (sessionData) {
            const session = JSON.parse(sessionData)
            accessToken = session.access_token
          }
        } catch (e) {
          console.warn('Gagal membaca data sesi auth:', e)
        }

        if (!accessToken) {
          throw new Error('Tidak terautentikasi - token sesi tidak ditemukan')
        }

        // Kirim data langsung ke Route API handler Supabase
        const response = await fetch('/api/gps/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            speed_kmh: speed ? Math.round(speed * 3.6) : 0, // Konversi m/s ke km/h
            heading: heading || 0,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Gagal mengirimkan koordinat GPS')
        }

        // Perbarui tanda waktu pengiriman terakhir yang berhasil
        lastSentTimeRef.current = now
        onSuccess?.({ lat: latitude, lng: longitude })
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
      } finally {
        isPublishingRef.current = false
      }
    }

    const handleGeoError = (geoError: GeolocationPositionError) => {
      const errorMessages: Record<number, string> = {
        1: 'Akses lokasi ditolak pengemudi. Izinkan GPS di pengaturan browser.',
        2: 'Satelit tidak mendeteksi posisi perangkat driver.',
        3: 'Waktu tunggu (timeout) pencarian GPS habis.',
      }
      const message = errorMessages[geoError.code] || `Kesalahan GPS: ${geoError.message}`
      onError?.(new Error(message))
    }

    // Daftarkan fungsi pelacakan ke hardware GPS perangkat lewat bantuan API OS
    watchIdRef.current = navigator.geolocation.watchPosition(handlePositionChange, handleGeoError, {
      enableHighAccuracy: true, // Wajib menyalakan GPS Hardware berakurasi tinggi
      timeout: 15000, // Batas toleransi tunggu sensor merespon
      maximumAge: 0, // Selalu minta data realtime baru, bukan cache lama
    })

    // Cleanup pembersihan pendaftaran event OS saat komponen unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled, interval, onError, onSuccess])

  return {}
}
