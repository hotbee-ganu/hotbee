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

const testSkus = [
  { sku: 'MRnHs-Wh-L', desc: 'White Tee L', price: '499' },
  { sku: 'MRnHs-Bk-XL', desc: 'Black Tee XL', price: '499' },
  { sku: 'MRnHs-Bk-S', desc: 'Black Tee S', price: '499' },
];

async function placeOrder(index, itemInfo) {
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

  const orderNum = 'HBTEST' + Math.floor(100000 + Math.random() * 900000);
  const testOrder = {
    order_number: orderNum,
    qikink_shipping: '1',
    gateway: 'Prepaid',
    total_order_value: itemInfo.price,
    line_items: [
      {
        search_from_my_products: 0,
        sku: itemInfo.sku,
        quantity: '1',
        price: itemInfo.price,
        print_type_id: 1,
      }
    ],
    shipping_address: {
      first_name: `Tester${index}`,
      last_name: 'Hotbee',
      address1: `${100 + index} Test Street, Koramangala`,
      phone: `987654321${index}`,
      email: `test${index}@hotbee.in`,
      city: 'Bengaluru',
      zip: '560034',
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

  const data = await res.json();
  console.log(`Placed order ${index} (${itemInfo.sku}):`, data);
  return data;
}

async function main() {
  console.log('Placing sandbox test orders...');
  for (let i = 0; i < testSkus.length; i++) {
    await placeOrder(i + 2, testSkus[i]);
    // Small delay between calls
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nFetching updated order list from Qikink Sandbox:');
  const clientId = envVars.QIKINK_API_KEY;
  const clientSecret = envVars.QIKINK_API_SECRET;
  const baseUrl = envVars.QIKINK_BASE_URL || 'https://sandbox.qikink.com/api';
  const tokenRes = await fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }),
  });
  const tokenData = await tokenRes.json();

  const ordersRes = await fetch(`${baseUrl}/order`, {
    method: 'GET',
    headers: {
      ClientId: clientId,
      Accesstoken: tokenData.Accesstoken,
      Accept: 'application/json',
    },
  });
  const list = await ordersRes.json();
  console.log(`\nTOTAL ORDERS IN SANDBOX: ${list.length}`);
  console.log(JSON.stringify(list, null, 2));
}

main().catch(console.error);
