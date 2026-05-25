-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role       AS ENUM ('manager', 'dispatcher', 'driver');
CREATE TYPE vehicle_type    AS ENUM ('motor', 'pickup', 'van', 'truck');
CREATE TYPE vehicle_status  AS ENUM ('idle', 'active', 'maintenance', 'offline');
CREATE TYPE driver_status   AS ENUM ('available', 'on_duty', 'off', 'suspended');
CREATE TYPE shipment_status AS ENUM ('pending','assigned','pickup','in_transit','delivered','failed','returned');
CREATE TYPE shipment_priority AS ENUM ('regular', 'express', 'same_day');
CREATE TYPE route_status    AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE notif_type      AS ENUM ('alert', 'info', 'warning', 'success');

-- USERS
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VEHICLES
CREATE TABLE vehicles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_number        TEXT NOT NULL UNIQUE,
  type                vehicle_type NOT NULL,
  capacity_kg         NUMERIC(10,2) NOT NULL,
  capacity_volume_m3  NUMERIC(10,3) NOT NULL,
  status              vehicle_status NOT NULL DEFAULT 'idle',
  fuel_type           TEXT NOT NULL,
  year                INT NOT NULL,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DRIVERS
CREATE TABLE drivers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  license_number    TEXT NOT NULL UNIQUE,
  license_expiry    DATE NOT NULL,
  status            driver_status NOT NULL DEFAULT 'available',
  total_deliveries  INT NOT NULL DEFAULT 0,
  rating            NUMERIC(3,2) NOT NULL DEFAULT 5.00
);

-- ROUTES (defined before shipments because shipments FK to routes)
CREATE TABLE routes (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id              UUID NOT NULL REFERENCES vehicles(id),
  driver_id               UUID NOT NULL REFERENCES drivers(id),
  date                    DATE NOT NULL,
  status                  route_status NOT NULL DEFAULT 'planned',
  origin_lat              NUMERIC(10,7) NOT NULL,
  origin_lng              NUMERIC(10,7) NOT NULL,
  waypoints               JSONB NOT NULL DEFAULT '[]',
  optimized_distance_km   NUMERIC(10,2),
  estimated_duration_min  INT,
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ
);

-- SHIPMENTS
CREATE TABLE shipments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code       TEXT NOT NULL UNIQUE,
  driver_id           UUID REFERENCES drivers(id) ON DELETE SET NULL,
  route_id            UUID REFERENCES routes(id) ON DELETE SET NULL,
  status              shipment_status NOT NULL DEFAULT 'pending',
  sender_name         TEXT NOT NULL,
  sender_address      TEXT NOT NULL,
  recipient_name      TEXT NOT NULL,
  recipient_address   TEXT NOT NULL,
  recipient_lat       NUMERIC(10,7) NOT NULL,
  recipient_lng       NUMERIC(10,7) NOT NULL,
  weight_kg           NUMERIC(10,3) NOT NULL,
  volume_m3           NUMERIC(10,4) NOT NULL,
  priority            shipment_priority NOT NULL DEFAULT 'regular',
  estimated_delivery  TIMESTAMPTZ,
  actual_delivery     TIMESTAMPTZ,
  failure_reason      TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SHIPMENT STATUS LOGS
CREATE TABLE shipment_status_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id   UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  old_status    TEXT NOT NULL,
  new_status    TEXT NOT NULL,
  changed_by    UUID NOT NULL REFERENCES users(id),
  note          TEXT,
  location_lat  NUMERIC(10,7),
  location_lng  NUMERIC(10,7),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GPS LOGS
CREATE TABLE gps_logs (
  id            BIGSERIAL PRIMARY KEY,
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id     UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  lat           NUMERIC(10,7) NOT NULL,
  lng           NUMERIC(10,7) NOT NULL,
  speed_kmh     NUMERIC(6,2) NOT NULL DEFAULT 0,
  heading       NUMERIC(6,2) NOT NULL DEFAULT 0,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notif_type NOT NULL DEFAULT 'info',
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  related_entity  TEXT,
  related_id      UUID,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ANALYTICS SNAPSHOTS
CREATE TABLE analytics_snapshots (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date                  DATE NOT NULL UNIQUE,
  total_shipments       INT NOT NULL DEFAULT 0,
  delivered             INT NOT NULL DEFAULT 0,
  failed                INT NOT NULL DEFAULT 0,
  success_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_delivery_time_min NUMERIC(10,2),
  active_vehicles       INT NOT NULL DEFAULT 0,
  on_time_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,
  top_areas             JSONB NOT NULL DEFAULT '[]',
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);