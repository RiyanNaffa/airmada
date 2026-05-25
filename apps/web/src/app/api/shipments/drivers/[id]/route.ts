import { NextResponse } from 'next/server'
import { mockShipments } from '@/mocks'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: driverId } = await params

  // Filter mockShipments agar hanya mengembalikan paket milik driver_id yang sesuai
  const filteredShipments = mockShipments.filter((shipment) => shipment.driver_id === driverId)

  return NextResponse.json(filteredShipments)
}
