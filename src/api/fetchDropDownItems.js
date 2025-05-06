const BASE_URL = 'https://vai.dev.sms.visionariesai.com/api';

const fetchFromApi = async (url, token) => {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ ${url} ${res.status}:`, body);
      throw new Error(`Failed to fetch from ${url} (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error(`🔥 Error fetching from ${url}:`, err);
    throw err;
  }
};

export const fetchDropDownItems = async (token, branchId, yearId) => {
  const departmentsUrl = `${BASE_URL}/departments/?is_active=true&branch=${branchId}`;
  const designationsUrl = `${BASE_URL}/designations/?is_active=true`;
  const groupsUrl = `${BASE_URL}/groups/?branch=${branchId}`;
  const standardsUrl = `${BASE_URL}/standards/?branch=${branchId}&is_active=true&academic_year=${yearId}`;

  try {
    const [departments, designations, groups, standards] = await Promise.all([
      fetchFromApi(departmentsUrl, token),
      fetchFromApi(designationsUrl, token),
      fetchFromApi(groupsUrl, token),
      fetchFromApi(standardsUrl, token),
    ]);

    return { departments, designations, groups, standards };
  } catch (err) {
    console.error('🔥 Failed to fetch dropdown items:', err);
    throw err;
  }
};
