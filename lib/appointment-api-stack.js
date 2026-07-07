"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentApiStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const apigw = __importStar(require("aws-cdk-lib/aws-apigateway"));
const medislot_function_1 = require("./medislot-function");
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
class AppointmentApiStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const createAppointment = new medislot_function_1.MediSlotFunction(this, 'CreateAppointment', {
            handler: 'createAppointment.handler',
            config,
            environment: runtimeEnv,
        });
        appointmentsTable.grantReadWriteData(createAppointment.fn);
        const cancelAppointment = new medislot_function_1.MediSlotFunction(this, 'CancelAppointment', {
            handler: 'cancelAppointment.handler',
            config,
            environment: runtimeEnv,
        });
        appointmentsTable.grantReadWriteData(cancelAppointment.fn);
        // --- read path --------------------------------------------------------
        const getAppointment = new medislot_function_1.MediSlotFunction(this, 'GetAppointment', {
            handler: 'getAppointment.handler',
            config,
            environment: runtimeEnv,
        });
        appointmentsTable.grantReadData(getAppointment.fn);
        const listAppointments = new medislot_function_1.MediSlotFunction(this, 'ListAppointments', {
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
exports.AppointmentApiStack = AppointmentApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwb2ludG1lbnQtYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwb2ludG1lbnQtYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBRW5DLG1FQUFxRDtBQUNyRCxrRUFBb0Q7QUFFcEQsMkRBQXVEO0FBTXZEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBYSxtQkFBb0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNoRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQStCO1FBQ3ZFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFekIsMEVBQTBFO1FBQzFFLGtEQUFrRDtRQUNsRCxNQUFNLGlCQUFpQixHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdEUsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDNUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUNqRCxhQUFhLEVBQUUsTUFBTSxDQUFDLGtCQUFrQjtZQUN4QyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsbUJBQW1CO1NBQ2hELENBQUMsQ0FBQztRQUVILGlCQUFpQixDQUFDLHVCQUF1QixDQUFDO1lBQ3hDLFNBQVMsRUFBRSxRQUFRO1lBQ25CLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ25FLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxF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Q0wsQ0FBQztDQUNGO0FBNUVELGtEQTRFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBhcGlndyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBFbnZDb25maWcgfSBmcm9tICcuL2FkZGl0aW9uYWwtY29uc3RydWN0cyc7XG5pbXBvcnQgeyBNZWRpU2xvdEZ1bmN0aW9uIH0gZnJvbSAnLi9tZWRpc2xvdC1mdW5jdGlvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwb2ludG1lbnRBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBjb25maWc6IEVudkNvbmZpZztcbn1cblxuLyoqXG4gKiBQcm92aXNpb25zIHRoZSBhcHBvaW50bWVudCBzY2hlZHVsaW5nIEFQSTpcbiAqXG4gKiAgIEFQSSBHYXRld2F5ICAgICAgICAgICAgICAgICAgICAgICAgICBMYW1iZGEgICAgICAgICAgICAgICAgICAgICBEeW5hbW9EQlxuICogICBQT1NUICAgL2FwaS9hcHBvaW50bWVudHMgICAgICAgIC0+ICBjcmVhdGVBcHBvaW50bWVudEZuICAgLStcbiAqICAgR0VUICAgIC9hcGkvYXBwb2ludG1lbnRzICAgICAgICAtPiAgbGlzdEFwcG9pbnRtZW50c0ZuICAgICArLT4gYXBwb2ludG1lbnRzIHRhYmxlXG4gKiAgIEdFVCAgICAvYXBpL2FwcG9pbnRtZW50cy97aWR9ICAgLT4gIGdldEFwcG9pbnRtZW50Rm4gICAgICAgfCAgICAgKGJ5RGF0ZSBHU0kpXG4gKiAgIERFTEVURSAvYXBpL2FwcG9pbnRtZW50cy97aWR9ICAgLT4gIGNhbmNlbEFwcG9pbnRtZW50Rm4gICAtK1xuICpcbiAqIFRoZSBzYW1lIHN0YWNrIGNsYXNzIGlzIGluc3RhbnRpYXRlZCBmb3IgdGhlIGRldiwgc3RhZ2luZyBhbmQgcHJvZFxuICogZW52aXJvbm1lbnRzIGZyb20gYmluL2FwcC50cyBiYXNlZCBvbiB0aGUgYGVudmAgY29udGV4dCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFwcG9pbnRtZW50QXBpU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBwb2ludG1lbnRBcGlTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IGNvbmZpZyB9ID0gcHJvcHM7XG5cbiAgICAvLyBObyBmaXhlZCBwaHlzaWNhbCBuYW1lOiBDbG91ZEZvcm1hdGlvbiBkZXJpdmVzIGEgcGVyLXN0YWNrIHVuaXF1ZSBuYW1lLFxuICAgIC8vIHNvIGRldi9zdGFnaW5nL3Byb2QgY2FuIGNvZXhpc3QgaW4gb25lIGFjY291bnQuXG4gICAgY29uc3QgYXBwb2ludG1lbnRzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0FwcG9pbnRtZW50c1RhYmxlJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdhcHBvaW50bWVudElkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjb25maWcudGFibGVSZW1vdmFsUG9saWN5LFxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogY29uZmlnLnBvaW50SW5UaW1lUmVjb3ZlcnksXG4gICAgfSk7XG5cbiAgICBhcHBvaW50bWVudHNUYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleCh7XG4gICAgICBpbmRleE5hbWU6ICdieURhdGUnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdkYXRlJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ2FwcG9pbnRtZW50SWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcnVudGltZUVudiA9IHsgQVBQT0lOVE1FTlRTX1RBQkxFX05BTUU6IGFwcG9pbnRtZW50c1RhYmxlLnRhYmxlTmFtZSB9O1xuXG4gICAgLy8gLS0tIHdyaXRlIHBhdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgY29uc3QgY3JlYXRlQXBwb2ludG1lbnQgPSBuZXcgTWVkaVNsb3RGdW5jdGlvbih0aGlzLCAnQ3JlYXRlQXBwb2ludG1lbnQnLCB7XG4gICAgICBoYW5kbGVyOiAnY3JlYXRlQXBwb2ludG1lbnQuaGFuZGxlcicsXG4gICAgICBjb25maWcsXG4gICAgICBlbnZpcm9ubWVudDogcnVudGltZUVudixcbiAgICB9KTtcbiAgICBhcHBvaW50bWVudHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY3JlYXRlQXBwb2ludG1lbnQuZm4pO1xuXG4gICAgY29uc3QgY2FuY2VsQXBwb2ludG1lbnQgPSBuZXcgTWVkaVNsb3RGdW5jdGlvbih0aGlzLCAnQ2FuY2VsQXBwb2ludG1lbnQnLCB7XG4gICAgICBoYW5kbGVyOiAnY2FuY2VsQXBwb2ludG1lbnQuaGFuZGxlcicsXG4gICAgICBjb25maWcsXG4gICAgICBlbnZpcm9ubWVudDogcnVudGltZUVudixcbiAgICB9KTtcbiAgICBhcHBvaW50bWVudHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoY2FuY2VsQXBwb2ludG1lbnQuZm4pO1xuXG4gICAgLy8gLS0tIHJlYWQgcGF0aCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgY29uc3QgZ2V0QXBwb2ludG1lbnQgPSBuZXcgTWVkaVNsb3RGdW5jdGlvbih0aGlzLCAnR2V0QXBwb2ludG1lbnQnLCB7XG4gICAgICBoYW5kbGVyOiAnZ2V0QXBwb2ludG1lbnQuaGFuZGxlcicsXG4gICAgICBjb25maWcsXG4gICAgICBlbnZpcm9ubWVudDogcnVudGltZUVudixcbiAgICB9KTtcbiAgICBhcHBvaW50bWVudHNUYWJsZS5ncmFudFJlYWREYXRhKGdldEFwcG9pbnRtZW50LmZuKTtcblxuICAgIGNvbnN0IGxpc3RBcHBvaW50bWVudHMgPSBuZXcgTWVkaVNsb3RGdW5jdGlvbih0aGlzLCAnTGlzdEFwcG9pbnRtZW50cycsIHtcbiAgICAgIGhhbmRsZXI6ICdsaXN0QXBwb2ludG1lbnRzLmhhbmRsZXInLFxuICAgICAgY29uZmlnLFxuICAgICAgZW52aXJvbm1lbnQ6IHJ1bnRpbWVFbnYsXG4gICAgfSk7XG4gICAgYXBwb2ludG1lbnRzVGFibGUuZ3JhbnRSZWFkRGF0YShsaXN0QXBwb2ludG1lbnRzLmZuKTtcblxuICAgIC8vIC0tLSBBUEkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlndy5SZXN0QXBpKHRoaXMsICdBcHBvaW50bWVudEFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiBgbWVkaXNsb3QtYXBwb2ludG1lbnRzLSR7Y29uZmlnLmVudk5hbWV9YCxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHsgc3RhZ2VOYW1lOiBjb25maWcuZW52TmFtZSB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBpUm9vdCA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhcGknKTtcbiAgICBjb25zdCBhcHBvaW50bWVudHMgPSBhcGlSb290LmFkZFJlc291cmNlKCdhcHBvaW50bWVudHMnKTtcbiAgICBhcHBvaW50bWVudHMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGNyZWF0ZUFwcG9pbnRtZW50LmZuKSk7XG4gICAgYXBwb2ludG1lbnRzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGxpc3RBcHBvaW50bWVudHMuZm4pKTtcblxuICAgIGNvbnN0IGFwcG9pbnRtZW50ID0gYXBwb2ludG1lbnRzLmFkZFJlc291cmNlKCd7aWR9Jyk7XG4gICAgYXBwb2ludG1lbnQuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ3cuTGFtYmRhSW50ZWdyYXRpb24oZ2V0QXBwb2ludG1lbnQuZm4pKTtcbiAgICBhcHBvaW50bWVudC5hZGRNZXRob2QoJ0RFTEVURScsIG5ldyBhcGlndy5MYW1iZGFJbnRlZ3JhdGlvbihjYW5jZWxBcHBvaW50bWVudC5mbikpO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHsgdmFsdWU6IGFwaS51cmwgfSk7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwcG9pbnRtZW50c1RhYmxlTmFtZScsIHtcbiAgICAgIHZhbHVlOiBhcHBvaW50bWVudHNUYWJsZS50YWJsZU5hbWUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==