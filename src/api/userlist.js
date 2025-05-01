// src/api/userlist.js
export const fetchUsersList = async (token, filters = {}) => {
  try {
    // 1) Build query string with only real values
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val != null && val !== '') {
        params.append(key, val);
      }
    });

    const url = `https://vai.dev.sms.visionariesai.com/api/users/?${params.toString()}`;
    console.log('📤 fetchUsersList →', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // 2) If non-2xx, try to parse and log the body
    if (!response.ok) {
      let body;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      console.error(`❌ [${response.status}]`, body);
      throw new Error(
        `fetchUsersList failed ${response.status}: ` +
        (body.detail || body.message || JSON.stringify(body))
      );
    }

    // 3) Otherwise parse and return
    const data = await response.json();
    return data; // { results, next, previous, meta… }

  } catch (err) {
    console.error('🔥 fetchUsersList error:', err);
    throw err;
  }
};
