import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { EnvConfig } from './additional-constructs';
export interface MediSlotFunctionProps {
    /** Handler entry, e.g. 'getAppointment.handler'. */
    readonly handler: string;
    /** Environment configuration driving log retention and alarms. */
    readonly config: EnvConfig;
    /** Environment variables passed to the function at runtime. */
    readonly environment?: Record<string, string>;
}
/**
 * MediSlot's standard Lambda packaging: every service function is expected to
 * ship with an explicit log group (so retention is controlled, not unlimited)
 * and an error alarm (so on-call hears about failures).
 *
 * NOTE: adoption is inconsistent — parts of the stack still create raw
 * `lambda.Function`s directly and therefore miss the log-retention and
 * alarming guarantees this construct exists to provide.
 */
export declare class MediSlotFunction extends Construct {
    readonly fn: lambda.Function;
    constructor(scope: Construct, id: string, props: MediSlotFunctionProps);
}
