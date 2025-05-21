import * as orgAdmin from './orgAdminDashboardApi';
//import * as teacher from './teacherDashboardApi';
//import * as student from './studentDashboardApi';
// Add more as needed

const dashboardApiMap = {
  'Organisation Admin': orgAdmin,
  //Teacher: teacher,
  //Student: student,
};

export function getDashboardApi(role) {
  return dashboardApiMap[role] || orgAdmin; // Fallback to orgAdmin
}
