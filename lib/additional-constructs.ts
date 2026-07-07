// Environment configuration for the MediSlot appointment service.
//
// Carries every per-environment value the stack needs, so a single stack
// class can express meaningful differences between environments without
// being duplicated.

import { RemovalPolicy } from 'aws-cdk-lib';

export interface EnvConfig {
  /** Logical environment name, e.g. 'dev', 'staging' or 'prod'. */
  readonly envName: string;
  /** How long Lambda logs are kept in this environment (days). */
  readonly logRetentionDays: number;
  /** Whether operational alarms should be provisioned in this environment. */
  readonly alarmsEnabled: boolean;
  /** Data retention behaviour for stateful resources in this environment. */
  readonly tableRemovalPolicy: RemovalPolicy;
  /** Whether the appointments table keeps point-in-time recovery backups. */
  readonly pointInTimeRecovery: boolean;
}

const SUPPORTED_ENVIRONMENTS = ['dev', 'staging', 'prod'];

export function getEnvConfig(envName: string): EnvConfig {
  if (!SUPPORTED_ENVIRONMENTS.includes(envName)) {
    throw new Error(
      `Unsupported environment '${envName}'. Supported: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  }
  return {
    envName,
    logRetentionDays: envName === 'dev' ? 7 : 30,
    alarmsEnabled: true,
    tableRemovalPolicy: envName === 'dev' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    pointInTimeRecovery: envName === 'prod',
  };
}
