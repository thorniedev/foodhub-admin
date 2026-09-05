async function getRealToken() {
  const params = new URLSearchParams();
  params.append('client_id', 'mhoubahar-backend');
  params.append('client_secret', 'eKaaItiYmBoy0nxJ0Cr7stIf6G8yMC0e');
  params.append('username', 'chanthonkim296@gmail.com');
  params.append('password', 'qwerqwer');
  params.append('grant_type', 'password');

  const res = await fetch('https://auth.mhoubahar.store/realms/foodhub/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  console.log('Token status:', res.status);
  const data = await res.json();
  if (data.access_token) {
    console.log('Got access token! Length:', data.access_token.length);
    return data.access_token;
  } else {
    console.log('Error:', data);
  }
}

getRealToken().catch(console.error);
