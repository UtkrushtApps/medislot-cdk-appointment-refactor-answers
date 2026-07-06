# Solution Steps

1. Extend the environment configuration model in `lib/additional-constructs.ts` so each supported environment carries the DynamoDB removal policy it needs: `DESTROY` for `dev` and `RETAIN` for `staging`.

2. Keep `getEnvConfig` as the single validation point for supported environments and return the full per-environment config from a map instead of only returning the environment name.

3. In `lib/appointment-api-stack.ts`, remove the hardcoded DynamoDB `tableName: 'Appointments'` property. Let CloudFormation/CDK generate a unique physical table name per stack deployment so dev and staging in the same account do not collide.

4. Set the table `removalPolicy` from `config.appointmentsTableRemovalPolicy` so dev synthesizes a `Delete` deletion policy and staging synthesizes a `Retain` deletion policy.

5. Configure `CreateAppointmentFn` with an `environment` block containing `APPOINTMENTS_TABLE_NAME: appointmentsTable.tableName`. This passes the generated table name to the Lambda at deploy time.

6. Replace the wildcard IAM statement with a least-privilege policy statement that grants only the needed DynamoDB actions, such as `dynamodb:PutItem` and `dynamodb:DescribeTable`, and scopes `resources` to `appointmentsTable.tableArn`.

7. Update `lambda/handler.ts` to read the table name from `process.env.APPOINTMENTS_TABLE_NAME` at runtime instead of using the hardcoded `Appointments` value.

8. Build and verify the project with `npm run build`, then synthesize both environments with `npm run synth:dev` and `npm run synth:staging`.

9. Run `npm test` to confirm the CDK assertions pass for dev and staging, including removal policy, Lambda environment variable, no wildcard DynamoDB IAM access, and the unchanged `appointmentId` partition key.

