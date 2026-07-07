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
export declare function getEnvConfig(envName: string): EnvConfig;
