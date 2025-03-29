interface Config {
  BACKEND_PORT: string;
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
};

export default config;
