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
  const isFormData = updatedData instanceof FormData;

  const headers = {
    Authorization: `Token ${token}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: isFormData ? updatedData : JSON.stringify(updatedData),
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

export const createUserDetails = async (token, newUserData) => {
  const url = `${BASE_URL}/users/`;
  const isFormData = newUserData instanceof FormData;

  const headers = {
    Authorization: `Token ${token}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };

  console.log('Creating user with data:', newUserData);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? newUserData : JSON.stringify(newUserData),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error(`❌ createUserDetails ${res.status}:`, body);
      throw new Error(`Failed to create user (${res.status})`);
    }

    return JSON.parse(body);
  } catch (err) {
    console.error('🔥 createUserDetails error:', err);
    throw err;
  }
};

export const fetchUserSchema = async (token) => {
  const url = `${BASE_URL}/users/`;
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
      console.error(`❌ fetchUserSchema ${res.status}:`, body);
      throw new Error(`Failed to load user schema (${res.status})`);
    }
    const schema = await res.json();
    console.log('✅ fetched user schema:', schema);
    return schema;
  } catch (err) {
    console.error('🔥 fetchUserSchema error:', err);
    throw err;
  }
};










