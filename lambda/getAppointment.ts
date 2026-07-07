// NOTE: This asset is loaded as-is by the Lambda runtime. It is compiled to
// plain JS at build time in a real pipeline; for this assessment the handler
// is intentionally simple and only provides supporting runtime context.

const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME ?? '';

export const handler = async (event: any) => {
  const appointmentId = event?.pathParameters?.id;
  if (!appointmentId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'appointment id is required' }) };
  }

  // Placeholder lookup — in the deployed service this reads from DynamoDB.
  const item = {
    appointmentId,
    tableName: TABLE_NAME,
    retrievedAt: new Date().toISOString(),
  };

  return { statusCode: 200, body: JSON.stringify({ appointment: item }) };
};
