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
content: 'You are a nonprofit CRM assistant. Write a very short internal donor summary using ONLY the provided donor profile and donation history. Do not guess or add details.',
},
{
role: 'user',
content: `Write a donor summary in EXACTLY 2–3 lines (not bullets, not headers, not an email).

Rules:
- Mention total donated + number of donations (if derivable from data).
- Mention recency (last donation date or "Not available").
- Mention the main cause/campaign focus if visible; otherwise say "Not available".
- No "next steps", no recommendations, no extra formatting.
- Use ONLY the data below. If something is missing, say "Not available".

Donation History:
${resultDonations}

Donor Details:
${resultDonor}`,
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
await UPDATE(Donors).set({ summary: generatedDescription }).where({ ID: donorID });
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

