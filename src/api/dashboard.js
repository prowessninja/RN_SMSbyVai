// src/api/dashboard.js
export const fetchCurrentUser = async (token) => {
  const response = await fetch('https://vai.dev.sms.visionariesai.com/api/users/current-user/', {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`, // Corrected header format
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};

export const fetchBranches = async (token) => {
  const response = await fetch('https://vai.dev.sms.visionariesai.com/api/branches/?is_active=true', {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`, // Corrected header format
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};

export const fetchAcademicYears = async (token) => {
  const response = await fetch('https://vai.dev.sms.visionariesai.com/api/academic-years/', {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`, // Corrected header format
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};
