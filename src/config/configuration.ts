import type { Config, Production } from './config.interface';

export const configuration = async (): Promise<Config> => {
  const { config: environment } = <{ config: Production }> await import(`${__dirname}/envs/${process.env.NODE_ENV || 'development'}`);

  return environment;
};
