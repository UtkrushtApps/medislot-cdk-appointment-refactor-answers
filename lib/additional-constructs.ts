import * as cdk from 'aws-cdk-lib';

// Environment configuration for the MediSlot appointment service.
//
// The stack consumes this configuration so the same AppointmentApiStack class can
// be synthesized for multiple environments while still expressing the behavior
// that differs between environments.

export interface EnvConfig {
  /** Logical environment name, e.g. 'dev' or 'staging'. */
  readonly envName: string;

  /** Removal policy for the environment's appointments table. */
  readonly appointmentsTableRemovalPolicy: cdk.RemovalPolicy;
}

const ENVIRONMENT_CONFIGS: Record<string, EnvConfig> = {
  dev: {
    envName: 'dev',
    appointmentsTableRemovalPolicy: cdk.RemovalPolicy.DESTROY,
  },
  staging: {
    envName: 'staging',
    appointmentsTableRemovalPolicy: cdk.RemovalPolicy.RETAIN,
  },
};

const SUPPORTED_ENVIRONMENTS = Object.keys(ENVIRONMENT_CONFIGS);

export function getEnvConfig(envName: string): EnvConfig {
  const config = ENVIRONMENT_CONFIGS[envName];

  if (!config) {
    throw new Error(
      `Unsupported environment '${envName}'. Supported: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
  }

  return config;
}
