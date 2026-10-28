import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
});

async function main() {
  const clientId = envVars.QIKINK_API_KEY;
  const clientSecret = envVars.QIKINK_API_SECRET;
  const baseUrl = envVars.QIKINK_BASE_URL || 'https://sandbox.qikink.com/api';

  const body = new URLSearchParams({ ClientId: clientId, client_secret: clientSecret });
  const tokenRes = await fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const tokenData = await tokenRes.json();
  const token = tokenData.Accesstoken;

  const res = await fetch(`${baseUrl}/order`, {
    method: 'GET',
    headers: {
      ClientId: clientId,
      Accesstoken: token,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  console.log('Orders on Qikink sandbox:', text);
}

main().catch(console.error);
