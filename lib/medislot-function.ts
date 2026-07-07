import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as path from 'path';
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
export class MediSlotFunction extends Construct {
  public readonly fn: lambda.Function;

  constructor(scope: Construct, id: string, props: MediSlotFunctionProps) {
    super(scope, id);

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: props.config.logRetentionDays === 7
        ? logs.RetentionDays.ONE_WEEK
        : logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.fn = new lambda.Function(this, 'Fn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: props.handler,
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      environment: props.environment,
      logGroup,
    });

    if (props.config.alarmsEnabled) {
      new cloudwatch.Alarm(this, 'ErrorsAlarm', {
        metric: this.fn.metricErrors({ period: cdk.Duration.minutes(5) }),
        threshold: 1,
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
    }
  }
}
