import { create } from 'zustand'
// import type { GpsLog } from "@airmada/types"

interface VehiclePosition {
  vehicle_id: string
  plate_number: string
  driver_name: string
  lat: number
  lng: number
  speed_kmh: number
  heading: number
  updated_at: string
}

interface FleetStore {
  positions: Record<string, VehiclePosition>
  updatePosition: (vehicleId: string, data: VehiclePosition) => void
  clearPositions: () => void
}

export const useFleetStore = create<FleetStore>((set) => ({
  positions: {},
  updatePosition: (vehicleId, data) =>
    set((state) => ({
      positions: { ...state.positions, [vehicleId]: data },
    })),
  clearPositions: () => set({ positions: {} }),
}))
