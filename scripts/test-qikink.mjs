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

  const testOrder = {
    order_number: 'TEST' + Date.now().toString().slice(-8),
    qikink_shipping: '1',
    gateway: 'Prepaid',
    total_order_value: '499',
    line_items: [
      {
        search_from_my_products: 1,
        sku: 'MRnHs-Bk-M',
        quantity: '1',
        price: '499',
      }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'Customer',
      address1: '123 Test Street, Cyber Hub',
      address2: 'Near Tech Park',
      phone: '9876543210',
      email: 'test@hotbee.in',
      city: 'Bengaluru',
      zip: '560001',
      province: 'Karnataka',
      country_code: 'IN',
    },
  };

  const res = await fetch(`${baseUrl}/order/create`, {
    method: 'POST',
    headers: {
      ClientId: clientId,
      Accesstoken: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testOrder),
  });

  console.log('Order create status:', res.status);
  const text = await res.text();
  console.log('Order create response:', text);
}

main().catch(console.error);
