var baseUrl = sessionStorage.getItem('AppBaseURLMenu');
function logoutUser() {
    sessionStorage.clear();
    window.location.href = `${baseUrl}/Login/Login`;
}
function ChangePasswordUser() {
    sessionStorage.clear();
    window.location.href = `${baseUrl}/Login/ChangePassword`;
}
window.ChangePasswordUser = ChangePasswordUser;
window.logoutUser = logoutUser;


