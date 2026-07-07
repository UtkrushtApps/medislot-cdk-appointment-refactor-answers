# Solution Steps

1. Extend `EnvConfig` in `lib/additional-constructs.ts` so each environment carries everything the stack needs: the DynamoDB removal policy (`DESTROY` for `dev`, `RETAIN` for `staging` and `prod`) and whether point-in-time recovery is enabled (`prod` only), alongside the existing log-retention and alarm knobs. Keep `getEnvConfig` as the single validation point.

2. In `lib/appointment-api-stack.ts`, remove the hardcoded `tableName: 'Appointments'` so CloudFormation derives a unique physical name per stack — dev, staging and prod can then coexist in one account. Drive `removalPolicy` and `pointInTimeRecovery` from the config.

3. Route **every** service function through the `MediSlotFunction` construct (`lib/medislot-function.ts`), not just the read path — this is what gives each function its explicit log group with retention and its error alarm. `CreateAppointmentFn` and `CancelAppointmentFn` were raw `lambda.Function`s in the starter.

4. Replace all hand-written wildcard IAM statements (`dynamodb:*`, some on `*`) with grants: `appointmentsTable.grantReadWriteData(...)` for the write path (create, cancel) and `appointmentsTable.grantReadData(...)` for the read path (get, list). Grants emit named actions scoped to the table **and its indexes** — which also fixes the list function's missing permission on the `byDate` GSI.

5. Pass `APPOINTMENTS_TABLE_NAME: appointmentsTable.tableName` as the `environment` of every function, and update all four handlers in `lambda/` to read `process.env.APPOINTMENTS_TABLE_NAME` instead of the hardcoded `'Appointments'` literal.

6. Build with `npm run build`, synthesize all three environments (`npx cdk synth -c env=dev|staging|prod`), and run `npm test` — all 18 assertions pass: per-environment lifecycle (including prod PITR), unique physical names, least-privilege IAM, per-function runtime config, and the operational-consistency checks (log groups + alarms for all four functions).
