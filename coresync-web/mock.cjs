const http = require('http');

async function mock() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@alpha.com', password: '123' })
    });
    const { token } = await loginRes.json();
    
    // 2. Extract CompanyId from JWT
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    const companyId = payload.companyId;
    console.log("Company ID:", companyId);

    // 3. Mock Leads
    const leads = [
      { name: "TechCorp Solutions", email: "ceo@techcorp.com", phone: "(11) 99123-4567", estimatedValue: 45000.50 },
      { name: "Global Industries", email: "contact@globalind.com", phone: "(21) 98765-4321", estimatedValue: 120000.00 },
      { name: "NextGen Startups", email: "founder@nextgen.io", phone: "(31) 99999-1111", estimatedValue: 15000.00 },
      { name: "Alpha Finances", email: "investor@alpha.fin", phone: "(41) 98888-2222", estimatedValue: 250000.00 },
      { name: "Beta Commerce", email: "sales@betacommerce.net", phone: "(51) 97777-3333", estimatedValue: 8500.00 }
    ];

    for (const lead of leads) {
      const payloadObj = { ...lead, status: 'NEW' };
      const res = await fetch(`http://localhost:8080/api/webhooks/leads/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj)
      });
      console.log(`Lead ${lead.name}:`, res.status);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

mock();
