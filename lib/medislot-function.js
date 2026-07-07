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
exports.MediSlotFunction = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const constructs_1 = require("constructs");
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const cloudwatch = __importStar(require("aws-cdk-lib/aws-cloudwatch"));
const path = __importStar(require("path"));
/**
 * MediSlot's standard Lambda packaging: every service function is expected to
 * ship with an explicit log group (so retention is controlled, not unlimited)
 * and an error alarm (so on-call hears about failures).
 *
 * NOTE: adoption is inconsistent — parts of the stack still create raw
 * `lambda.Function`s directly and therefore miss the log-retention and
 * alarming guarantees this construct exists to provide.
 */
class MediSlotFunction extends constructs_1.Construct {
    constructor(scope, id, props) {
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
exports.MediSlotFunction = MediSlotFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaXNsb3QtZnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtZWRpc2xvdC1mdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQywyQ0FBdUM7QUFDdkMsK0RBQWlEO0FBQ2pELDJEQUE2QztBQUM3Qyx1RUFBeUQ7QUFDekQsMkNBQTZCO0FBWTdCOzs7Ozs7OztHQVFHO0FBQ0gsTUFBYSxnQkFBaUIsU0FBUSxzQkFBUztJQUc3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTRCO1FBQ3BFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDbkQsU0FBUyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUTtnQkFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUztZQUNoQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQ3pDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7WUFDeEMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87WUFDdEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNqRSxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7WUFDOUIsUUFBUTtTQUNULENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMvQixJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDeEMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pFLFNBQVMsRUFBRSxDQUFDO2dCQUNaLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3BCLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhO2FBQzVELENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUE5QkQsNENBOEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgKiBhcyBjbG91ZHdhdGNoIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBFbnZDb25maWcgfSBmcm9tICcuL2FkZGl0aW9uYWwtY29uc3RydWN0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVkaVNsb3RGdW5jdGlvblByb3BzIHtcbiAgLyoqIEhhbmRsZXIgZW50cnksIGUuZy4gJ2dldEFwcG9pbnRtZW50LmhhbmRsZXInLiAqL1xuICByZWFkb25seSBoYW5kbGVyOiBzdHJpbmc7XG4gIC8qKiBFbnZpcm9ubWVudCBjb25maWd1cmF0aW9uIGRyaXZpbmcgbG9nIHJldGVudGlvbiBhbmQgYWxhcm1zLiAqL1xuICByZWFkb25seSBjb25maWc6IEVudkNvbmZpZztcbiAgLyoqIEVudmlyb25tZW50IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uIGF0IHJ1bnRpbWUuICovXG4gIHJlYWRvbmx5IGVudmlyb25tZW50PzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuLyoqXG4gKiBNZWRpU2xvdCdzIHN0YW5kYXJkIExhbWJkYSBwYWNrYWdpbmc6IGV2ZXJ5IHNlcnZpY2UgZnVuY3Rpb24gaXMgZXhwZWN0ZWQgdG9cbiAqIHNoaXAgd2l0aCBhbiBleHBsaWNpdCBsb2cgZ3JvdXAgKHNvIHJldGVudGlvbiBpcyBjb250cm9sbGVkLCBub3QgdW5saW1pdGVkKVxuICogYW5kIGFuIGVycm9yIGFsYXJtIChzbyBvbi1jYWxsIGhlYXJzIGFib3V0IGZhaWx1cmVzKS5cbiAqXG4gKiBOT1RFOiBhZG9wdGlvbiBpcyBpbmNvbnNpc3RlbnQg4oCUIHBhcnRzIG9mIHRoZSBzdGFjayBzdGlsbCBjcmVhdGUgcmF3XG4gKiBgbGFtYmRhLkZ1bmN0aW9uYHMgZGlyZWN0bHkgYW5kIHRoZXJlZm9yZSBtaXNzIHRoZSBsb2ctcmV0ZW50aW9uIGFuZFxuICogYWxhcm1pbmcgZ3VhcmFudGVlcyB0aGlzIGNvbnN0cnVjdCBleGlzdHMgdG8gcHJvdmlkZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lZGlTbG90RnVuY3Rpb24gZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZm46IGxhbWJkYS5GdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTWVkaVNsb3RGdW5jdGlvblByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IGxvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgJ0xvZ0dyb3VwJywge1xuICAgICAgcmV0ZW50aW9uOiBwcm9wcy5jb25maWcubG9nUmV0ZW50aW9uRGF5cyA9PT0gN1xuICAgICAgICA/IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFS1xuICAgICAgICA6IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfTU9OVEgsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgdGhpcy5mbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0ZuJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICBoYW5kbGVyOiBwcm9wcy5oYW5kbGVyLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdsYW1iZGEnKSksXG4gICAgICBlbnZpcm9ubWVudDogcHJvcHMuZW52aXJvbm1lbnQsXG4gICAgICBsb2dHcm91cCxcbiAgICB9KTtcblxuICAgIGlmIChwcm9wcy5jb25maWcuYWxhcm1zRW5hYmxlZCkge1xuICAgICAgbmV3IGNsb3Vkd2F0Y2guQWxhcm0odGhpcywgJ0Vycm9yc0FsYXJtJywge1xuICAgICAgICBtZXRyaWM6IHRoaXMuZm4ubWV0cmljRXJyb3JzKHsgcGVyaW9kOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSB9KSxcbiAgICAgICAgdGhyZXNob2xkOiAxLFxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcbiAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogY2xvdWR3YXRjaC5UcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==