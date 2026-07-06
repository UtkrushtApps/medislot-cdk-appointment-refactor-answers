import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { EnvConfig } from './additional-constructs';

export interface AppointmentApiStackProps extends cdk.StackProps {
  readonly config: EnvConfig;
}

/**
 * Provisions the appointment scheduling API:
 *   API Gateway (POST /api/appointments) -> Lambda -> DynamoDB appointments table.
 *
 * The same stack class is instantiated for the dev and staging environments
 * from bin/app.ts based on the `env` context value.
 */
export class AppointmentApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppointmentApiStackProps) {
    super(scope, id, props);

    const { config } = props;

    const appointmentsTable = new dynamodb.Table(this, 'AppointmentsTable', {
      partitionKey: { name: 'appointmentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: config.appointmentsTableRemovalPolicy,
    });

    const createAppointmentFn = new lambda.Function(this, 'CreateAppointmentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      environment: {
        APPOINTMENTS_TABLE_NAME: appointmentsTable.tableName,
      },
    });

    createAppointmentFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:PutItem', 'dynamodb:DescribeTable'],
        resources: [appointmentsTable.tableArn],
      })
    );

    const api = new apigw.RestApi(this, 'AppointmentApi', {
      restApiName: `medislot-appointments-${config.envName}`,
      deployOptions: { stageName: config.envName },
    });

    const apiRoot = api.root.addResource('api');
    const appointments = apiRoot.addResource('appointments');
    appointments.addMethod('POST', new apigw.LambdaIntegration(createAppointmentFn));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'AppointmentsTableName', {
      value: appointmentsTable.tableName,
    });
  }
}
