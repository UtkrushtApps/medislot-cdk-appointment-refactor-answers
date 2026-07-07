#!/usr/bin/env node
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
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const appointment_api_stack_1 = require("../lib/appointment-api-stack");
const additional_constructs_1 = require("../lib/additional-constructs");
const app = new cdk.App();
// Environment is selected via context, e.g. `cdk synth -c env=dev` or `-c env=staging`.
const envName = app.node.tryGetContext('env') ?? 'dev';
const config = (0, additional_constructs_1.getEnvConfig)(envName);
new appointment_api_stack_1.AppointmentApiStack(app, `MediSlot-AppointmentApi-${config.envName}`, {
    config,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
    },
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsdUNBQXFDO0FBQ3JDLGlEQUFtQztBQUNuQyx3RUFBbUU7QUFDbkUsd0VBQTREO0FBRTVELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLHdGQUF3RjtBQUN4RixNQUFNLE9BQU8sR0FBSSxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQVksSUFBSSxLQUFLLENBQUM7QUFDbkUsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQ0FBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXJDLElBQUksMkNBQW1CLENBQUMsR0FBRyxFQUFFLDJCQUEyQixNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7SUFDeEUsTUFBTTtJQUNOLEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtRQUN4QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxXQUFXO0tBQ3REO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEFwcG9pbnRtZW50QXBpU3RhY2sgfSBmcm9tICcuLi9saWIvYXBwb2ludG1lbnQtYXBpLXN0YWNrJztcbmltcG9ydCB7IGdldEVudkNvbmZpZyB9IGZyb20gJy4uL2xpYi9hZGRpdGlvbmFsLWNvbnN0cnVjdHMnO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG4vLyBFbnZpcm9ubWVudCBpcyBzZWxlY3RlZCB2aWEgY29udGV4dCwgZS5nLiBgY2RrIHN5bnRoIC1jIGVudj1kZXZgIG9yIGAtYyBlbnY9c3RhZ2luZ2AuXG5jb25zdCBlbnZOYW1lID0gKGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2VudicpIGFzIHN0cmluZykgPz8gJ2Rldic7XG5jb25zdCBjb25maWcgPSBnZXRFbnZDb25maWcoZW52TmFtZSk7XG5cbm5ldyBBcHBvaW50bWVudEFwaVN0YWNrKGFwcCwgYE1lZGlTbG90LUFwcG9pbnRtZW50QXBpLSR7Y29uZmlnLmVudk5hbWV9YCwge1xuICBjb25maWcsXG4gIGVudjoge1xuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gPz8gJ3VzLWVhc3QtMScsXG4gIH0sXG59KTtcblxuYXBwLnN5bnRoKCk7XG4iXX0=