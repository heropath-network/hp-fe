/**
 * MUX V3 Oracle Configuration
 */

export const MUX_V3_ORACLE_API = import.meta.env.PROD
  ? "https://dev1.heropath.network/api"
  : "https://app.mux.network/api";

// MQTT Configuration
export const MUX3_MQTT_SERVICE = "app.mux.network";
export const MUX3_MQTT_SERVICE_PORT = 443;
export const MUX3_MQTT_SERVICE_PATH = "/api/mux3/oracle";
export const MUX3_MQTT_SERVICE_USERNAME = "mux3oracle";
export const MUX3_MQTT_SERVICE_PASSWORD = "mux3oracle";
export const MUX3_MQTT_SERVICE_USE_SSL = true; 

