import cds from '@sap/cds'
import { OrchestrationClient, buildAzureContentSafetyFilter } from '@sap-ai-sdk/orchestration'

/**
 * Generate Donor Summary

 * @On(event = { "DonorSummary" }, entity = "donorMgmtSrv.Donors")
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
*/
export default async function (request) {
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
content: 'You are an expert fundraising copywriter specializing in nonprofit campaigns. Create compelling, donor-focused summary that inspire action.',
},
{
role: 'user',
content: `Generate a compelling donor summary based on donor data and donations made by the donor so far:
Donation History : ${resultDonations}
Donor Details: ${resultDonor}

Create a persuasive, donor-focused summary that resonates with the donor's values.
Highlight the importance of their contributions and the difference they make in the community.
Highlight Total Donations made so far, identify donation durations/pattern if any.
Suggest what I have to do interms of Next steps to engage the Donor to contribute more.
Keep it concise (under 200 words)

Write only the summary with various headers, Do not write it as email.`,
}
]
}
}
}
);
const response = await orchestrationClient.chatCompletion();

const generatedDescription = response.getContent();
//console.log(`Successfully executed chat completion. ${generatedDescription}`);
request.data.summary = generatedDescription;
// Return the generated description
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

}

