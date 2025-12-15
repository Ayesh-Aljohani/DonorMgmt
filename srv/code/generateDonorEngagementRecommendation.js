import { OrchestrationClient, buildAzureContentSafetyFilter } from '@sap-ai-sdk/orchestration'

/**
*
* @On(event = { "generateDonorSummary" }, entity = "testBP_CampaignSrv.Donors")
* @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
*/
export default async function(request) {
const { Donors } = cds.entities;
const { Donations } = cds.entities;
const donorID = request.params[0].ID;

if (!donorID) {
return request.reject(400, 'Donor ID is required.');
}

// Fetch the Donor details using the Donor ID
const donor = await SELECT.one.from(Donors).where({ ID: donorID });
if (!donor) {
return request.reject(404, 'Donor not found.');
}

// Fetch the Donation details using the Donor ID
const donations = await SELECT.from(Donations).where({ donor_ID: donorID });
if (!donations) {
return request.reject(404, 'Donor has No Donations');
}

const resultDonor = JSON.stringify(donor, null, 2);
const resultDonations = JSON.stringify(donations, null, 2);

// Placeholder for LLM integration
// Here you would call your LLM API with the title, cause, and goalAmount to generate a description
// For example:
// const generatedDescription = await callLLMApi(title, cause, goalAmount);
//LLM Call Begins
const chatModelName = 'gpt-4o';
const resourceGroup = 'default';

const filter = buildAzureContentSafetyFilter({
Hate: 'ALLOW_SAFE',
Violence: 'ALLOW_SAFE',
SelfHarm: 'ALLOW_SAFE',
Sexual: 'ALLOW_SAFE',
})


try {
const orchestrationClient = new OrchestrationClient(
{
promptTemplating: {
model: {
name: chatModelName
},
prompt: {
template: [
{
role: 'system',
content: 'You are a nonprofit CRM assistant. Your task is to recommend ONE clear, practical next best action to engage a donor, based strictly on their profile and donation history.',
},
{
role: 'user',
content: `Recommend ONE next best action for this donor.

Rules:
- Output MUST be exactly ONE short sentence.
- Start with a verb (e.g., "Send", "Invite", "Call", "Remind", "Share").
- Base the recommendation ONLY on the data below (recency, frequency, causes, campaigns).
- Be realistic and actionable for a fundraiser.
- Do NOT explain your reasoning.
- Do NOT include multiple options.
- Do NOT use bullet points, headers, or extra text.

Examples of valid outputs:
- "Send a thank-you email acknowledging their recent contribution."
- "Invite the donor to the upcoming annual gala."
- "Call the donor to discuss a new project aligned with their interests."
- "Remind the donor about renewing their recurring donation."

Donor Details:
${resultDonor}

Donation History:
${resultDonations}`,
}
]
}
}
}
);
const response = await orchestrationClient.chatCompletion();

const generatedDescription = response.getContent();
//console.log(`Successfully executed chat completion. ${generatedDescription}`);
// Assign the generated description to the summary property of the request data object
//request.data.summary = generatedDescription;
// Persist so the UI can display it
await UPDATE(Donors).set({ nextstep: generatedDescription }).where({ ID: donorID });
// Return it as well (useful for debuggin
// Return the generated description to the caller
return generatedDescription;
}
catch (error) {
console.log(
`Error while generating Donor Description.
Error: ${error}`
);
throw error;
}

//LLM Call Ends

};

