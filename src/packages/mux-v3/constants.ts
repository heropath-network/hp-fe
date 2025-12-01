/**
 * MUX V3 Oracle Configuration
 */

export const MUX_V3_ORACLE_API = import.meta.env.PROD ? `${window.location.origin}/api` : 'https://app.mux.network/api'

// MQTT Configuration
export const MUX3_MQTT_SERVICE = import.meta.env.PROD ? `${window.location.host}` : 'app.mux.network'
export const MUX3_MQTT_SERVICE_PORT = 443
export const MUX3_MQTT_SERVICE_PATH = import.meta.env.PROD ? '/api/oracle' : '/api/mux3/oracle'
export const MUX3_MQTT_SERVICE_USERNAME = 'mux3oracle'
export const MUX3_MQTT_SERVICE_PASSWORD = 'mux3oracle'
export const MUX3_MQTT_SERVICE_USE_SSL = true

export const MUX_V3_SUPPORTED_MARKETS = new Set<string>(['BTC/USD', 'ETH/USD']) 

