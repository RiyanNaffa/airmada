-- Performance indexes
CREATE INDEX idx_shipments_driver_id      ON shipments(driver_id);
CREATE INDEX idx_shipments_status         ON shipments(status);
CREATE INDEX idx_shipments_created_at     ON shipments(created_at DESC);
CREATE INDEX idx_gps_vehicle_time         ON gps_logs(vehicle_id, recorded_at DESC);
CREATE INDEX idx_routes_vehicle_date      ON routes(vehicle_id, date);
CREATE INDEX idx_status_logs_shipment     ON shipment_status_logs(shipment_id);
CREATE INDEX idx_notifications_user_read  ON notifications(user_id, is_read);