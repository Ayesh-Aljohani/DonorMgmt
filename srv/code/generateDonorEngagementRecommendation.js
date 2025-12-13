import cds from '@sap/cds'
import { OrchestrationClient, buildAzureContentSafetyFilter } from '@sap-ai-sdk/orchestration'

/**
 * 
 * @On(event = { "" }, entity = "donorMgmtSrv.Donors")
 * @param {cds.Request} request - User information, tenant-specific CDS model, headers and query parameters
 * @param {Function} next - Callback function to the next handler
*/
export default async function (request) {
  const { Donors, Donations } = cds.entities
  const donorID = request.params?.[0]?.ID

  if (!donorID) return request.reject(400, 'Donor ID is required.')

  const donor = await SELECT.one.from(Donors).where({ ID: donorID })
  if (!donor) return request.reject(404, 'Donor not found.')

  const donations = await SELECT.from(Donations).where({ donor_ID: donorID })
  if (!donations || donations.length === 0) return request.reject(404, 'Donor has no donations.')

  // --- light stats for better recommendations ---
  const amounts = donations.map(d => Number(d.amount ?? 0)).filter(n => Number.isFinite(n))
  const totalAmount = amounts.reduce((a, b) => a + b, 0)
  const donationCount = donations.length

  const dates = donations
    .map(d => d.donationDate)
    .filter(Boolean)
    .map(d => new Date(d))
    .filter(d => !Number.isNaN(d.getTime()))
    .sort((a, b) => a - b)

  const firstDonation = dates[0] ? dates[0].toISOString().slice(0, 10) : null
  const lastDonation = dates[dates.length - 1] ? dates[dates.length - 1].toISOString().slice(0, 10) : null

  const currencies = [...new Set(donations.map(d => d.currencyCode).filter(Boolean))]
  const topCampaigns = topN(donations.map(d => d.campaign).filter(Boolean), 3)
  const topCauses = topN(donations.map(d => d.cause).filter(Boolean), 3)

  const donorContext = {
    ID: donor.ID,
    name: donor.name,
    status: donor.status,
    donorType: donor.donorType,
    isRecurringDonor: donor.isRecurringDonor,
    isHNI: donor.isHNI
  }

  const donationContext = donations.map(d => ({
    donationDate: d.donationDate,
    amount: d.amount,
    currencyCode: d.currencyCode,
    city: d.city,
    cause: d.cause,
    campaign: d.campaign
  }))

  const filter = buildAzureContentSafetyFilter({
    Hate: 'ALLOW_SAFE',
    Violence: 'ALLOW_SAFE',
    SelfHarm: 'ALLOW_SAFE',
    Sexual: 'ALLOW_SAFE'
  })

  try {
    const orchestrationClient = new OrchestrationClient({
      model: { name: 'gpt-4o' },
      filtering: { input: filter, output: filter },
      prompt: {
        template: [
          {
            role: 'system',
            content:
              'You are a nonprofit CRM assistant. Your task is to recommend the single best next action to engage a donor, based strictly on donor profile + donation history. Be practical and specific.'
          },
          {
            role: 'user',
            content: `Choose ONE "next best action" for this donor.

You must output ONLY valid JSON in this exact shape:
{
  "action": "<one short action label>",
  "reason": "<1-2 sentences, grounded in the data>",
  "timing": "<when to do it>",
  "messageDraft": "<2-4 sentences the user can copy/paste>"
}

Constraints:
- action MUST be one of:
  ["Send Thank You Email","Invite to Annual Gala","Remind for Renewal","Call the Donor and discuss about new project","Request meeting with leadership","Share impact report","Invite to volunteer/visit","Ask for recurring donation setup"]
- No hallucinations: if a detail is not in the data, don’t mention it.
- Use donation recency/frequency/amounts + top causes/campaigns to justify.
- If donor status is In-Active (or similar), prefer re-activation actions (call or impact report) over invites.

Donor:
${JSON.stringify(donorContext, null, 2)}

Donation stats:
${JSON.stringify(
  { donationCount, totalAmount, currencies, firstDonation, lastDonation, topCampaigns, topCauses },
  null,
  2
)}

Donation history (trimmed fields):
${JSON.stringify(donationContext, null, 2)}`
          }
        ]
      }
    })

    const response = await orchestrationClient.chatCompletion()
    const nextStepJson = response.getContent()

    // Save into Donors.nextstep (String(200) per your entity)
    // (We store only the action label to fit 200 chars; keep full JSON returned to UI)
    let actionLabel = nextStepJson
    try {
      const parsed = JSON.parse(nextStepJson)
      if (parsed?.action) actionLabel = String(parsed.action).slice(0, 200)
    } catch (_) {
      // if model didn't return JSON, store raw truncated (still return raw to UI)
      actionLabel = String(nextStepJson).slice(0, 200)
    }

    await UPDATE(Donors).set({ nextstep: actionLabel }).where({ ID: donorID })

    return nextStepJson
  } catch (error) {
    console.log(`Error while generating Donor Next Step. Error: ${error}`)
    throw error
  }
}

/** helpers */
function topN(values, n = 3) {
  const m = new Map()
  for (const v of values) m.set(v, (m.get(v) || 0) + 1)
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }))
}

