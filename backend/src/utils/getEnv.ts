export const getEnv = (key: string, defaultValue: any) => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
};
