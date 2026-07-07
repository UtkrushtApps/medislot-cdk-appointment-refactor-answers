import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvConfig } from './additional-constructs';
export interface AppointmentApiStackProps extends cdk.StackProps {
    readonly config: EnvConfig;
}
/**
 * Provisions the appointment scheduling API:
 *
 *   API Gateway                          Lambda                     DynamoDB
 *   POST   /api/appointments        ->  createAppointmentFn   -+
 *   GET    /api/appointments        ->  listAppointmentsFn     +-> appointments table
 *   GET    /api/appointments/{id}   ->  getAppointmentFn       |     (byDate GSI)
 *   DELETE /api/appointments/{id}   ->  cancelAppointmentFn   -+
 *
 * The same stack class is instantiated for the dev, staging and prod
 * environments from bin/app.ts based on the `env` context value.
 */
export declare class AppointmentApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: AppointmentApiStackProps);
}
