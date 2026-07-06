#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppointmentApiStack } from '../lib/appointment-api-stack';
import { getEnvConfig } from '../lib/additional-constructs';

const app = new cdk.App();

// Environment is selected via context, e.g. `cdk synth -c env=dev` or `-c env=staging`.
const envName = (app.node.tryGetContext('env') as string) ?? 'dev';
const config = getEnvConfig(envName);

new AppointmentApiStack(app, `MediSlot-AppointmentApi-${config.envName}`, {
  config,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});

app.synth();
