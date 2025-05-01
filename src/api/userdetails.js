// src/api/userdetails.js
const BASE_URL = 'https://vai.dev.sms.visionariesai.com/api';

export const fetchUserDetails = async (token, id) => {
  const url = `${BASE_URL}/users/${id}/`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ fetchUserDetails ${res.status}:`, body);
      throw new Error(`Failed to load user details (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('🔥 fetchUserDetails error:', err);
    throw err;
  }
};

export const updateUserDetails = async (token, id, updatedData) => {
  const url = `${BASE_URL}/users/${id}/`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ updateUserDetails ${res.status}:`, body);
      throw new Error(`Failed to update user details (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error('🔥 updateUserDetails error:', err);
    throw err;
  }
};
    