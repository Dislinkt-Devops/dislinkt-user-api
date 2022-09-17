import type { config as development } from './envs/development';
import type { config as production } from './envs/production';

export type Development = typeof development;
export type Production = typeof production;
export type Config = Development | Production;
