import cds from '@sap/cds'
import { OrchestrationClient, buildAzureContentSafetyFilter } from '@sap-ai-sdk/orchestration'

/**
 * @On(event = { "donationLikelihoodScore" }, entity = "donorMgmtSrv.Donors")
 */
export default async function (request) {
  const { Donors, Donations } = cds.entities
  const donorID = request.params?.[0]?.ID

  if (!donorID) return request.reject(400, 'Donor ID is required.')

  const donor = await SELECT.one.from(Donors).where({ ID: donorID })
  if (!donor) return request.reject(404, 'Donor not found.')

  const donations = await SELECT.from(Donations).where({ donor_ID: donorID })

  // If no donations => Low
  if (!donations || donations.length === 0) {
    await UPDATE(Donors)
      .set({ donationLikelihoodLabel: 'Low', donationLikelihoodScore: 0 })
      .where({ ID: donorID })
    return await SELECT.one.from(Donors).where({ ID: donorID })
  }

  const resultDonor = JSON.stringify(donor, null, 2)
  const resultDonations = JSON.stringify(donations, null, 2)

  const filter = buildAzureContentSafetyFilter({
    Hate: 'ALLOW_SAFE',
    Violence: 'ALLOW_SAFE',
    SelfHarm: 'ALLOW_SAFE',
    Sexual: 'ALLOW_SAFE'
  })

  try {
    const orchestrationClient = new OrchestrationClient({
      // inputModeration: filter, // optional depending on your setup
      promptTemplating: {
        model: { name: 'gpt-5' },
        prompt: {
          template: [
            {
              role: 'system',
              content:
                'You are a nonprofit CRM data analyst. Estimate the likelihood a donor will donate again within the next 6 months using ONLY the given donor profile and donation history. Be conservative. No guessing beyond the data.'
            },
            {
              role: 'user',
              content: `Return ONLY valid JSON with this exact shape:
{"score": <integer 0-100>, "label": "High"|"Medium"|"Low", "reason": "<max 20 words>"}

Rules:
- score must be an integer 0..100
- label must match score bands:
  - High: 70..100
  - Medium: 40..69
  - Low: 0..39
- Base decision mostly on:
  recency (how long since last donation), frequency, consistency over time, donation patterns.
- No extra keys. No markdown. No explanations outside JSON.

Donor:
${resultDonor}

Donation history:
${resultDonations}`
            }
          ]
        }
      }
    })

    const response = await orchestrationClient.chatCompletion()
    const raw = String(response.getContent() || '').trim()

    // Parse JSON safely
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error(`AI response was not JSON: ${raw.slice(0, 200)}`)
      parsed = JSON.parse(match[0])
    }

    let score = Number(parsed.score)
    if (!Number.isFinite(score)) score = 0
    score = Math.max(0, Math.min(100, Math.round(score)))

    let label = String(parsed.label || 'Low')
    if (!['High', 'Medium', 'Low'].includes(label)) {
      label = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low'
    }

    // Enforce bands
    if (label === 'High' && score < 70) score = 70
    if (label === 'Medium' && (score < 40 || score > 69)) score = 55
    if (label === 'Low' && score > 39) score = 20

    // Persist for UI
    await UPDATE(Donors)
      .set({
        donationLikelihoodLabel: label,
        donationLikelihoodScore: score
      })
      .where({ ID: donorID })

    return await SELECT.one.from(Donors).where({ ID: donorID })
  } catch (error) {
    console.log(`Error while generating Donation Likelihood. Error: ${error}`)
    throw error
  }
};