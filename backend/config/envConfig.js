require("dotenv").config();

const env = (process.env.APP_ENV || process.env.NODE_ENV || "development").toLowerCase();
const isProduction = env === "production" || env === "prod";

const config = {
  appEnv: isProduction ? "production" : "development",
  isProduction,
  isDevelopment: !isProduction,
  port: process.env.PORT || 5000,

  // Database settings (switches based on APP_ENV or falls back to standard DB_* variables)
  db: {
    host: (isProduction ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST) || process.env.DB_HOST || "localhost",
    port: Number((isProduction ? process.env.PROD_DB_PORT : process.env.DEV_DB_PORT) || process.env.DB_PORT || 3306),
    user: (isProduction ? process.env.PROD_DB_USER : process.env.DEV_DB_USER) || process.env.DB_USER || "root",
    password: (isProduction ? process.env.PROD_DB_PASSWORD : process.env.DEV_DB_PASSWORD) || process.env.DB_PASSWORD || "",
    database: (isProduction ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME) || process.env.DB_NAME || "leegality",
  },

  // Leegality API Gateway URL
  leegalityBaseUrl:
    (isProduction
      ? process.env.PROD_LEEGALITY_BASE_URL
      : process.env.DEV_LEEGALITY_BASE_URL) ||
    process.env.LEEGALITY_BASE_URL ||
    "https://sandbox.leegality.com/api",

  // Client CORS URL
  clientUrl:
    (isProduction ? process.env.PROD_CLIENT_URL : process.env.DEV_CLIENT_URL) ||
    process.env.CLIENT_URL ||
    "http://localhost:5173",
};

module.exports = config;
