-- Enable RLS on all tables
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots  ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- USERS: user bisa baca dirinya sendiri; manager bisa baca semua
CREATE POLICY "users_select" ON users FOR SELECT
  USING (id = auth.uid() OR current_user_role() = 'manager');
CREATE POLICY "users_update_self" ON users FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "users_insert_manager" ON users FOR INSERT
  WITH CHECK (current_user_role() = 'manager');

-- VEHICLES: driver read-only; dispatcher/manager full
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT
  USING (current_user_role() IN ('manager', 'dispatcher', 'driver'));
CREATE POLICY "vehicles_write" ON vehicles FOR ALL
  USING (current_user_role() IN ('manager', 'dispatcher'));

-- SHIPMENTS: driver hanya lihat miliknya
CREATE POLICY "shipments_select_driver" ON shipments FOR SELECT
  USING (
    current_user_role() IN ('manager', 'dispatcher')
    OR (current_user_role() = 'driver' AND driver_id = (
      SELECT id FROM drivers WHERE user_id = auth.uid()
    ))
  );
CREATE POLICY "shipments_write" ON shipments FOR ALL
  USING (current_user_role() IN ('manager', 'dispatcher'));

-- NOTIFICATIONS: user hanya lihat miliknya
CREATE POLICY "notif_select" ON notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "notif_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ANALYTICS: manager dan dispatcher saja
CREATE POLICY "analytics_select" ON analytics_snapshots FOR SELECT
  USING (current_user_role() IN ('manager', 'dispatcher'));
CREATE POLICY "analytics_insert" ON analytics_snapshots FOR INSERT
  WITH CHECK (current_user_role() = 'manager');