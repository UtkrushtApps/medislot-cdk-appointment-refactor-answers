// NOTE: This asset is loaded as-is by the Lambda runtime. It is compiled to
// plain JS at build time in a real pipeline; for this assessment the handler
// is intentionally simple and only provides supporting runtime context.

import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME ?? '';

export const handler = async (event: any) => {
  let body: any = {};
  try {
    body = event && event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid JSON body' }) };
  }

  const { patientId, slot } = body;
  if (!patientId || !slot) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'patientId and slot are required' }),
    };
  }

  const item = {
    appointmentId: randomUUID(),
    patientId,
    slot,
    tableName: TABLE_NAME,
    createdAt: new Date().toISOString(),
  };

  return {
    statusCode: 201,
    body: JSON.stringify({ message: 'Appointment created', appointment: item }),
  };
};
