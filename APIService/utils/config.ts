interface Config {
  BACKEND_PORT: string;
  COOKIE_TIMEOUT_MIN: string;
  LOGGING: number;
  MAX_SCAN_DEPTH: number;
  DELTA_SERVICE_URL: string;
  HUDI_SERVICE_URL: string;
  PARQUET_SERVICE_URL: string;
}

/**
 * Helper function to retrieve and validate environment variables.
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Error if the environment variable is not set.
 */
const getEnvVariable = (key: keyof Config): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};

const config: Config = {
  BACKEND_PORT: getEnvVariable("BACKEND_PORT"),
  COOKIE_TIMEOUT_MIN: getEnvVariable("COOKIE_TIMEOUT_MIN"),
  LOGGING: Number(getEnvVariable("LOGGING")),
  MAX_SCAN_DEPTH: Number(getEnvVariable("MAX_SCAN_DEPTH")),
  DELTA_SERVICE_URL: getEnvVariable("DELTA_SERVICE_URL"),
  HUDI_SERVICE_URL: getEnvVariable("HUDI_SERVICE_URL"),
  PARQUET_SERVICE_URL: getEnvVariable("PARQUET_SERVICE_URL"),
};

export default config;
