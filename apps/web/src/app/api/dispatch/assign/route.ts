import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Dispatch Assignment API
 * Assigns a shipment to a driver and fetches available dispatch data.
 * @location apps/web/src/app/api/dispatch/assign/route.ts
 */
export async function GET(request: NextRequest) {
  try {
    // Gunakan createClient dari server.ts (harus di-await karena menggunakan await cookies())
    const supabase = await createClient()

    // 1. Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil data profile/warehouse user
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('warehouse_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.warehouse_id) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: 'Warehouse context missing or forbidden' }, { status: 403 })
    }

    console.log('User:', {
      id: user.id,
      role: userProfile.role,
      warehouse_id: userProfile.warehouse_id,
    })

    // Fetch Shipments yang belum di-assign (Pending) di warehouse yang sama
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('*')
      .eq('warehouse_id', userProfile.warehouse_id)
      .eq('status', 'PENDING')

    console.log('Shipments query result:', {
      error: shipmentsError,
      count: shipments?.length || 0,
      warehouse_id: userProfile.warehouse_id,
    })

    // Fetch Drivers yang sedang available di warehouse yang sama
    // Drivers.user_id -> Users.id -> Users.warehouse_id
    const { data: driversRaw, error: driversError } = await supabase
      .from('drivers')
      .select('id, user_id, status, vehicle_id, users(id, full_name, short_name, warehouse_id)')
      .eq('status', 'AVAILABLE')

    console.log('Drivers raw query result:', {
      error: driversError,
      count: driversRaw?.length || 0,
    })

    // Filter drivers by warehouse (client-side since we can't filter on joined table directly)
    const drivers = (driversRaw || []).filter((d: any) => {
      // Ekstrak data user secara aman (antisipasi jika berbentuk Objek atau Array)
      const userData = Array.isArray(d.users) ? d.users[0] : d.users
      if (!userData?.warehouse_id) return false

      // Paksa ke tipe String agar aman dibandingakan jika ada perbedaan tipe data (e.g. string vs int)
      return String(userData.warehouse_id) === String(userProfile.warehouse_id)
    })

    console.log('Drivers filtered result:', {
      count: drivers.length,
      warehouse_id: userProfile.warehouse_id,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          shipments: shipments || [],
          drivers: drivers || [],
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Fetch dispatch data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Gunakan createClient dari server.ts (harus di-await karena menggunakan await cookies())
    const supabase = await createClient()

    const body = await request.json()
    const { shipment_id, driver_id } = body

    // 1. Authentication: Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    // Validasi Body
    if (!shipment_id || !driver_id) {
      return NextResponse.json({ error: 'shipment_id and driver_id are required' }, { status: 400 })
    }

    // Extract user.warehouse_id from auth
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, warehouse_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.warehouse_id) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot verify user warehouse' },
        { status: 403 }
      )
    }

    // 2. Authorization & 3. Validation
    // Fetch shipment untuk memvalidasi kepemilikan dan status
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, tracking_code, warehouse_id, status, driver_id')
      .eq('id', shipment_id)
      .single()

    // Fetch driver dengan user data untuk validasi warehouse
    // Drivers.user_id -> Users.id -> Users.warehouse_id
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, user_id, status, vehicle_id, users(id, full_name, short_name, warehouse_id)')
      .eq('id', driver_id)
      .single()

    // Cek apakah data eksis
    if (shipmentError || driverError || !shipment || !driver) {
      return NextResponse.json({ error: 'Shipment or driver not found' }, { status: 404 })
    }

    // Verify shipment.warehouse_id == user.warehouse_id && driver's user.warehouse_id == user.warehouse_id
    const driverData = driver as any
    const driverWarehouseId = Array.isArray(driverData.users)
      ? driverData.users[0]?.warehouse_id
      : driverData.users?.warehouse_id
    if (
      shipment.warehouse_id !== userProfile.warehouse_id ||
      driverWarehouseId !== userProfile.warehouse_id
    ) {
      return NextResponse.json({ error: 'Forbidden: Warehouse mismatch' }, { status: 403 })
    }

    // Check shipment exists and is not already delivered/failed
    if (['DELIVERED', 'FAILED'].includes(shipment.status)) {
      return NextResponse.json(
        { error: 'Conflict: Shipment is already delivered or failed' },
        { status: 409 }
      )
    }

    // Check driver exists and is available/active
    if (driver.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Conflict: Driver is not available' }, { status: 409 })
    }

    // 4. Business Logic & 5. Database Operations
    const assigned_at = new Date().toISOString()

    // Update shipment.driver_id = driver.id dan status ke 'ASSIGNED'
    const { data: updatedShipment, error: updateError } = await supabase
      .from('shipments')
      .update({
        driver_id: driver.user_id,
        status: shipment.status === 'PENDING' ? 'ASSIGNED' : shipment.status,
        updated_at: assigned_at,
      })
      .eq('id', shipment_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Insert audit_logs table
    const { error: auditError } = await supabase.from('audit_logs').insert({
      entity_type: 'shipment',
      entity_id: shipment_id,
      tracking_code: shipment.tracking_code,
      action: 'assign_driver',
      assigned_by: user.id,
      assigned_at: assigned_at,
      details: {
        previous_driver_id: shipment.driver_id,
        new_driver_id: driver_id,
      },
    })

    if (auditError) {
      console.error('Failed to write audit log:', auditError)
    }

    // 6. Response: Return updated shipment object
    // Safely extract driver user data (handle both array and object forms)
    const driverUserData = Array.isArray(driver.users) ? driver.users[0] : driver.users
    const driverName = driverUserData?.short_name || driverUserData?.full_name || 'Unknown'

    return NextResponse.json(
      {
        success: true,
        message: `Shipment ${shipment.tracking_code} assigned to driver ${driverName}`,
        timestamp: assigned_at,
        shipment: updatedShipment,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Assignment error:', error)

    // 7. Error Handling
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to assign shipment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
