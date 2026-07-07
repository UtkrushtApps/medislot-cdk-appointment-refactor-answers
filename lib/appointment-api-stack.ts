import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { EnvConfig } from './additional-constructs';
import { MediSlotFunction } from './medislot-function';

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
export class AppointmentApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppointmentApiStackProps) {
    super(scope, id, props);

    const { config } = props;

    // No fixed physical name: CloudFormation derives a per-stack unique name,
    // so dev/staging/prod can coexist in one account.
    const appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
      partitionKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: config.tableRemovalPolicy,
      pointInTimeRecovery: config.pointInTimeRecovery,
    });

    appointmentsTable.addGlobalSecondaryIndex({
      indexName: 'byDate',
      partitionKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
    });

    const runtimeEnv = { APPOINTMENTS_TABLE_NAME: appointmentsTable.tableName };

    // --- write path -------------------------------------------------------

    const createAppointment = new MediSlotFunction(this, 'CreateAppointment', {
      handler: 'createAppointment.handler',
      config,
      environment: runtimeEnv,
    });
    appointmentsTable.grantReadWriteData(createAppointment.fn);

    const cancelAppointment = new MediSlotFunction(this, 'CancelAppointment', {
      handler: 'cancelAppointment.handler',
      config,
      environment: runtimeEnv,
    });
    appointmentsTable.grantReadWriteData(cancelAppointment.fn);

    // --- read path --------------------------------------------------------

    const getAppointment = new MediSlotFunction(this, 'GetAppointment', {
      handler: 'getAppointment.handler',
      config,
      environment: runtimeEnv,
    });
    appointmentsTable.grantReadData(getAppointment.fn);

    const listAppointments = new MediSlotFunction(this, 'ListAppointments', {
      handler: 'listAppointments.handler',
      config,
      environment: runtimeEnv,
    });
    appointmentsTable.grantReadData(listAppointments.fn);

    // --- API --------------------------------------------------------------

    const api = new apigw.RestApi(this, 'AppointmentApi', {
      restApiName: `medislot-appointments-${config.envName}`,
      deployOptions: { stageName: config.envName },
    });

    const apiRoot = api.root.addResource('api');
    const appointments = apiRoot.addResource('appointments');
    appointments.addMethod('POST', new apigw.LambdaIntegration(createAppointment.fn));
    appointments.addMethod('GET', new apigw.LambdaIntegration(listAppointments.fn));

    const appointment = appointments.addResource('{id}');
    appointment.addMethod('GET', new apigw.LambdaIntegration(getAppointment.fn));
    appointment.addMethod('DELETE', new apigw.LambdaIntegration(cancelAppointment.fn));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'AppointmentsTableName', {
      value: appointmentsTable.tableName,
    });
  }
}
