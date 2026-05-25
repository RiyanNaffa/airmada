-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Increment driver total_deliveries on delivered
CREATE OR REPLACE FUNCTION increment_driver_deliveries()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    UPDATE drivers SET total_deliveries = total_deliveries + 1
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shipment_delivered
  AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION increment_driver_deliveries();

-- Set vehicle idle when route completed
CREATE OR REPLACE FUNCTION route_completed_idle_vehicle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    UPDATE vehicles SET status = 'idle' WHERE id = NEW.vehicle_id;
    UPDATE drivers SET status = 'available' WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_route_completed
  AFTER UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION route_completed_idle_vehicle();