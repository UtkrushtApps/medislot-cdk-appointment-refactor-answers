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

/** All IAM policy statements in a template, flattened. */
function allStatements(template: Template): any[] {
  const policies = template.findResources('AWS::IAM::Policy');
  const statements: any[] = [];
  for (const key of Object.keys(policies)) {
    statements.push(...(policies[key].Properties.PolicyDocument.Statement as any[]));
  }
  return statements;
}

/** Map of function logical id -> function resource, excluding CDK singletons. */
function serviceFunctions(template: Template): Record<string, any> {
  const fns = template.findResources('AWS::Lambda::Function');
  const out: Record<string, any> = {};
  for (const key of Object.keys(fns)) {
    // CDK-injected singleton/helper functions (e.g. log retention providers)
    // are not part of the service surface.
    if (key.startsWith('LogRetention') || key.startsWith('Custom')) continue;
    out[key] = fns[key];
  }
  return out;
}

describe('environment lifecycle — data retention per environment', () => {
  test('dev table uses a DESTROY removal policy', () => {
    synth('dev').hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Delete' });
  });

  test('staging table uses a RETAIN removal policy', () => {
    synth('staging').hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Retain' });
  });

  test('prod table uses a RETAIN removal policy', () => {
    synth('prod').hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Retain' });
  });

  test('prod table has point-in-time recovery enabled', () => {
    synth('prod').hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: Match.objectLike({
        PointInTimeRecoveryEnabled: true,
      }),
    });
  });
});

describe('multi-environment deployability — resource naming', () => {
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
    synth('dev').hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: Match.arrayWith([
        Match.objectLike({ AttributeName: 'appointmentId', KeyType: 'HASH' }),
      ]),
    });
  });

  test('appointments table keeps the byDate GSI', () => {
    synth('dev').hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({ IndexName: 'byDate' }),
      ]),
    });
  });
});

describe('IAM — least privilege', () => {
  test('no IAM policy grants dynamodb:* on all resources', () => {
    for (const stmt of allStatements(synth('dev'))) {
      const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
      const hasWildcardAction = actions.includes('dynamodb:*');
      const resourceIsStar =
        stmt.Resource === '*' ||
        (Array.isArray(stmt.Resource) && stmt.Resource.includes('*'));
      expect(hasWildcardAction && resourceIsStar).toBe(false);
    }
  });

  test('no dynamodb wildcard actions anywhere; permissions are named actions', () => {
    const allActions = allStatements(synth('dev')).flatMap((stmt) =>
      Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action]
    );
    expect(allActions.some((a) => a === 'dynamodb:*')).toBe(false);
    expect(allActions.some((a) => typeof a === 'string' && a.startsWith('dynamodb:'))).toBe(true);
  });

  test('read-path roles carry no dynamodb write actions', () => {
    const template = synth('dev');
    const policies = template.findResources('AWS::IAM::Policy');
    const writeActions = ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:BatchWriteItem'];
    for (const key of Object.keys(policies)) {
      if (!/GetAppointment|ListAppointments/.test(key)) continue;
      const statements = policies[key].Properties.PolicyDocument.Statement as any[];
      const actions = statements.flatMap((s) => (Array.isArray(s.Action) ? s.Action : [s.Action]));
      for (const w of writeActions) {
        expect(actions).not.toContain(w);
      }
    }
  });

  test('the list function can query the byDate index (index ARN is granted)', () => {
    const template = synth('dev');
    const policies = template.findResources('AWS::IAM::Policy');
    let listGrantsIndex = false;
    for (const key of Object.keys(policies)) {
      if (!/ListAppointments/.test(key)) continue;
      const json = JSON.stringify(policies[key].Properties.PolicyDocument);
      if (json.includes('index/')) listGrantsIndex = true;
    }
    expect(listGrantsIndex).toBe(true);
  });
});

describe('runtime configuration — no baked-in resource names', () => {
  test('every service function receives APPOINTMENTS_TABLE_NAME', () => {
    const fns = serviceFunctions(synth('dev'));
    expect(Object.keys(fns).length).toBeGreaterThanOrEqual(4);
    for (const key of Object.keys(fns)) {
      const vars = fns[key].Properties?.Environment?.Variables ?? {};
      expect(Object.keys(vars)).toContain('APPOINTMENTS_TABLE_NAME');
    }
  });

  test('lambda sources read the table name from the environment, not a literal', () => {
    const fs = require('fs');
    const path = require('path');
    const lambdaDir = path.join(__dirname, '..', 'lambda');
    for (const file of fs.readdirSync(lambdaDir).filter((f: string) => f.endsWith('.ts') && !f.endsWith('.d.ts'))) {
      const src = fs.readFileSync(path.join(lambdaDir, file), 'utf8');
      expect(src).toContain('APPOINTMENTS_TABLE_NAME');
      expect(src).not.toMatch(/TABLE_NAME\s*=\s*['"]Appointments['"]/);
    }
  });
});

describe('operational consistency — the MediSlot function standard', () => {
  test('every service function has an explicit log group with retention', () => {
    const template = synth('dev');
    const fnCount = Object.keys(serviceFunctions(template)).length;
    const logGroups = template.findResources('AWS::Logs::LogGroup');
    const withRetention = Object.values(logGroups).filter(
      (lg: any) => lg.Properties?.RetentionInDays !== undefined
    );
    expect(withRetention.length).toBeGreaterThanOrEqual(fnCount);
  });

  test('every service function has an error alarm', () => {
    const template = synth('dev');
    const fnCount = Object.keys(serviceFunctions(template)).length;
    const alarms = template.findResources('AWS::CloudWatch::Alarm');
    expect(Object.keys(alarms).length).toBeGreaterThanOrEqual(fnCount);
  });
});

describe('API surface — routes stay intact', () => {
  test.each([
    ['POST'],
    ['GET'],
    ['DELETE'],
  ])('the API exposes a %s method', (method) => {
    synth('dev').hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: method,
    });
  });
});
