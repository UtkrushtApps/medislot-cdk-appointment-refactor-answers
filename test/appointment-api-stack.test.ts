import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppointmentApiStack } from '../lib/appointment-api-stack';
import { getEnvConfig } from '../lib/additional-constructs';

function synth(envName: string): Template {
  const app = new cdk.App();
  const stack = new AppointmentApiStack(app, `MediSlot-AppointmentApi-${envName}`, {
    config: getEnvConfig(envName),
    env: { account: '111111111111', region: 'us-east-1' },
  });
  return Template.fromStack(stack);
}

describe('AppointmentApiStack — environment configuration and security', () => {
  test('dev table uses a DESTROY removal policy', () => {
    const template = synth('dev');
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
    });
  });

  test('staging table uses a RETAIN removal policy', () => {
    const template = synth('staging');
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
    });
  });

  test('lambda receives the table name via APPOINTMENTS_TABLE_NAME env var', () => {
    const template = synth('dev');
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.objectLike({
          APPOINTMENTS_TABLE_NAME: Match.anyValue(),
        }),
      },
    });
  });

  test('no IAM policy grants dynamodb:* on all resources', () => {
    const template = synth('dev');
    const policies = template.findResources('AWS::IAM::Policy');
    for (const key of Object.keys(policies)) {
      const statements = policies[key].Properties.PolicyDocument.Statement as any[];
      for (const stmt of statements) {
        const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
        const hasWildcardAction = actions.includes('dynamodb:*');
        const resourceIsStar =
          stmt.Resource === '*' ||
          (Array.isArray(stmt.Resource) && stmt.Resource.includes('*'));
        expect(hasWildcardAction && resourceIsStar).toBe(false);
      }
    }
  });

  test('lambda role has scoped dynamodb permissions (not wildcard actions)', () => {
    const template = synth('dev');
    const policies = template.findResources('AWS::IAM::Policy');
    const allActions: string[] = [];
    for (const key of Object.keys(policies)) {
      const statements = policies[key].Properties.PolicyDocument.Statement as any[];
      for (const stmt of statements) {
        const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
        allActions.push(...actions);
      }
    }
    expect(allActions.some((a) => a === 'dynamodb:*')).toBe(false);
    expect(allActions.some((a) => typeof a === 'string' && a.startsWith('dynamodb:'))).toBe(true);
  });

  test('dev and staging do not share the same hardcoded physical table name', () => {
    const devTable = synth('dev').findResources('AWS::DynamoDB::Table');
    const stagingTable = synth('staging').findResources('AWS::DynamoDB::Table');
    const devName = Object.values(devTable)[0]?.Properties?.TableName;
    const stagingName = Object.values(stagingTable)[0]?.Properties?.TableName;
    if (devName && stagingName) {
      expect(devName).not.toEqual(stagingName);
    }
  });

  test('appointments table keeps the appointmentId partition key', () => {
    const template = synth('dev');
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: Match.arrayWith([
        Match.objectLike({ AttributeName: 'appointmentId', KeyType: 'HASH' }),
      ]),
    });
  });
});
