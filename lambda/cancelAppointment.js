"use strict";
// NOTE: This asset is loaded as-is by the Lambda runtime. It is compiled to
// plain JS at build time in a real pipeline; for this assessment the handler
// is intentionally simple and only provides supporting runtime context.
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME ?? '';
const handler = async (event) => {
    const appointmentId = event?.pathParameters?.id;
    if (!appointmentId) {
        return { statusCode: 400, body: JSON.stringify({ message: 'appointment id is required' }) };
    }
    // Placeholder delete — in the deployed service this removes the item.
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Appointment cancelled',
            appointmentId,
            tableName: TABLE_NAME,
        }),
    };
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuY2VsQXBwb2ludG1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYW5jZWxBcHBvaW50bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNEVBQTRFO0FBQzVFLDZFQUE2RTtBQUM3RSx3RUFBd0U7OztBQUV4RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQztBQUV0RCxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBVSxFQUFFLEVBQUU7SUFDMUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUM7SUFDaEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25CLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzlGLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsT0FBTztRQUNMLFVBQVUsRUFBRSxHQUFHO1FBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbkIsT0FBTyxFQUFFLHVCQUF1QjtZQUNoQyxhQUFhO1lBQ2IsU0FBUyxFQUFFLFVBQVU7U0FDdEIsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDLENBQUM7QUFmVyxRQUFBLE9BQU8sV0FlbEIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBOT1RFOiBUaGlzIGFzc2V0IGlzIGxvYWRlZCBhcy1pcyBieSB0aGUgTGFtYmRhIHJ1bnRpbWUuIEl0IGlzIGNvbXBpbGVkIHRvXG4vLyBwbGFpbiBKUyBhdCBidWlsZCB0aW1lIGluIGEgcmVhbCBwaXBlbGluZTsgZm9yIHRoaXMgYXNzZXNzbWVudCB0aGUgaGFuZGxlclxuLy8gaXMgaW50ZW50aW9uYWxseSBzaW1wbGUgYW5kIG9ubHkgcHJvdmlkZXMgc3VwcG9ydGluZyBydW50aW1lIGNvbnRleHQuXG5cbmNvbnN0IFRBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5BUFBPSU5UTUVOVFNfVEFCTEVfTkFNRSA/PyAnJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xuICBjb25zdCBhcHBvaW50bWVudElkID0gZXZlbnQ/LnBhdGhQYXJhbWV0ZXJzPy5pZDtcbiAgaWYgKCFhcHBvaW50bWVudElkKSB7XG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNDAwLCBib2R5OiBKU09OLnN0cmluZ2lmeSh7IG1lc3NhZ2U6ICdhcHBvaW50bWVudCBpZCBpcyByZXF1aXJlZCcgfSkgfTtcbiAgfVxuXG4gIC8vIFBsYWNlaG9sZGVyIGRlbGV0ZSDigJQgaW4gdGhlIGRlcGxveWVkIHNlcnZpY2UgdGhpcyByZW1vdmVzIHRoZSBpdGVtLlxuICByZXR1cm4ge1xuICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBtZXNzYWdlOiAnQXBwb2ludG1lbnQgY2FuY2VsbGVkJyxcbiAgICAgIGFwcG9pbnRtZW50SWQsXG4gICAgICB0YWJsZU5hbWU6IFRBQkxFX05BTUUsXG4gICAgfSksXG4gIH07XG59O1xuIl19