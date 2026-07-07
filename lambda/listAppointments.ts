// NOTE: This asset is loaded as-is by the Lambda runtime. It is compiled to
// plain JS at build time in a real pipeline; for this assessment the handler
// is intentionally simple and only provides supporting runtime context.

const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME ?? '';
const INDEX_NAME = 'byDate';

export const handler = async (event: any) => {
  const date = event?.queryStringParameters?.date;
  if (!date) {
    return { statusCode: 400, body: JSON.stringify({ message: 'date query parameter is required' }) };
  }

  // Placeholder query — in the deployed service this queries the byDate GSI.
  const result = {
    date,
    tableName: TABLE_NAME,
    indexName: INDEX_NAME,
    appointments: [],
  };

  return { statusCode: 200, body: JSON.stringify(result) };
};
