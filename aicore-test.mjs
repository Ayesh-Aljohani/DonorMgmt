import 'dotenv/config';

function die(msg){
  console.error('\n❌ ' + msg);
  process.exit(1);
}

const raw = process.env.AICORE_SERVICE_KEY;
if (!raw) die('AICORE_SERVICE_KEY is NOT loaded. (dotenv not reading .env or file not in project root)');
console.log('✅ AICORE_SERVICE_KEY loaded. len=', raw.length);

let c;
try { c = JSON.parse(raw); }
catch(e){ die('AICORE_SERVICE_KEY is not valid JSON. First 80 chars: ' + raw.slice(0,80)); }

if (!c.clientid || !c.clientsecret || !c.url) die('Missing clientid/clientsecret/url in service key JSON.');
if (!c.serviceurls?.AI_API_URL) die('Missing serviceurls.AI_API_URL in service key JSON.');

const tokenUrl = c.url.replace(/\/$/,'') + '/oauth/token';
console.log('Auth URL:', tokenUrl);

const tokenResp = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(c.clientid + ':' + c.clientsecret).toString('base64')
  },
  body: new URLSearchParams({ grant_type: 'client_credentials' })
});

const tokenText = await tokenResp.text();
console.log('token_status=', tokenResp.status);
console.log('token_body_head=', tokenText.slice(0,200));
if (!tokenResp.ok) die('Token failed -> deployments will fail too.');

const tokenJson = JSON.parse(tokenText);

const aiApi = c.serviceurls.AI_API_URL.replace(/\/$/,'');
const depUrl = aiApi + '/v2/ai/deployments';
console.log('Deployments URL:', depUrl);

const depResp = await fetch(depUrl, {
  headers: { Authorization: 'Bearer ' + tokenJson.access_token }
});

const depBody = await depResp.text();
console.log('deployments_status=', depResp.status);
console.log('deployments_body_head=', depBody.slice(0,300));

if (!depResp.ok) die('Deployments call failed.');
console.log('\n✅ Deployments API reachable. SDK should work.');
