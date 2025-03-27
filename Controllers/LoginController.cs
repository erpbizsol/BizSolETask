using Bizsol_ESMS.Models;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;
using System.Xml.Linq;

namespace Bizsol_ETask.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IConfiguration _configurations;
        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
            _configurations = configuration;
        }

        public IActionResult Login()
        {
            return View();

        }
        [HttpPost]
        public IActionResult ValidateCompanyCode(string CompanyCode)
        {
            if (string.IsNullOrEmpty(CompanyCode))
            {
                return Json(new { success = false, message = "Company code is required!" });
            }
            string connectionString = _configuration.GetConnectionString("DefaultConnectionSQL");
            string ConnectionString1 = _configuration.GetConnectionString("ConnectionString");
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM ETaskCompanyConfiguration WHERE CompanyCode = @CompanyCode";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CompanyCode", CompanyCode);
                    int count = Convert.ToInt32(command.ExecuteScalar());
                    SqlDataReader dr = command.ExecuteReader();

                    if (count > 0)
                    {

                        if (dr.HasRows)
                        {
                            if (dr.Read())
                            {
                                ConnectionString1 = ConnectionString1.Replace("IP", dr["SQLIp"].ToString());
                                ConnectionString1 = ConnectionString1.Replace("DatabaseName", dr["DataBaseName"].ToString());
                                ConnectionString1 = ConnectionString1.Replace("UserID", dr["DataBaseUser"].ToString());
                                ConnectionString1 = ConnectionString1.Replace("Password", dr["DataBasePassword"].ToString());

                                HttpContext.Session.SetString("ConnectionString", ConnectionString1);
                                CookieOptions options = new CookieOptions
                                {

                                    Expires = DateTime.UtcNow.AddMinutes(60 * 60 * 1000),
                                    HttpOnly = false,
                                    Secure = true,
                                    SameSite = SameSiteMode.Strict
                                };
                                Response.Cookies.Append("CompanyCode", CompanyCode, options);
                                ViewBag.CompanyLogin = true;
                                ViewBag.IsValidCompanyCode = false;
                                return Json(new { success = true, message = "Company code is valid.", CompanyCode });
                            }
                        }
                        dr.Close();
                    }
                    connection.Close();
                    Response.Cookies.Delete("CompanyCode");
                }

                return Json(new { success = false, message = "Invalid company code!" });
            }
        }
        [HttpPost]
        public IActionResult Authenticate(string CompanyCode, string UserID, string Password)
        {
            var IsFirstLogin1 = "N";
            string Mobile = "", pw = "", companyCode = "", Name = "";
            string connectionString = _configuration.GetConnectionString("DefaultConnectionSQL");
            using (var connections = new SqlConnection(connectionString))
            {

                connections.Open();
                string query = $"SELECT Mobile,Password,isnull(CompanyCode,'ALL') CompanyCode,UserName FROM [BizSolETask_Main].[dbo].[MainUserMaster] LEFT JOIN ETaskCompanyConfiguration on MainUserMaster.ETaskCompanyConfiguration_Code = ETaskCompanyConfiguration.Code WHERE Mobile ='{UserID}' and Password='{Password}'";
                using (var command = new SqlCommand(query, connections))
                {
                    command.Parameters.AddWithValue("@UserID", UserID.Trim());
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.HasRows)
                        {
                            while (reader.Read())
                            {

                                Mobile = reader["Mobile"].ToString();
                                pw = reader["Password"].ToString();
                                companyCode = reader["CompanyCode"].ToString();
                                Name = reader["UserName"].ToString();
                            }
                        }
                    }
                }
                connections.Close(); 
            }
            if (UserID == Mobile && Password == pw)
            {
                var UserObj = new
                {
                    Code = "0",
                    EmployeeCard = "99",
                    EmployeeName = Name,
                    Email = "M@y.in",
                    MobileNo = UserID,
                    Status = "A",
                    EmployeeType = "A",
                    CompanyName = "Bizsol",
                    Role = "A",
                    IsFirstLogin = "N",
                    ProfilePic = ""
                };
                if (UserObj != null)
                {
                    HttpContext.Session.SetString("User", "a");
                    HttpContext.Session.SetString("EmployeeName", Name);
                    HttpContext.Session.SetString("EmployeeType", "A");
                    HttpContext.Session.SetString("MobileNo", UserID);
                    HttpContext.Session.SetString("Code", "0");
                    HttpContext.Session.SetString("Role", "A");
                    HttpContext.Session.SetString("IsMainUserMasterLogin", "");
                    return Ok(new { success = true, message = "Login successful!", IsFirstLogin = 'N'});
                }
            } else if (LogInUser(UserID ,Password)) {
                string connectionString1 = HttpContext.Session.GetString("ConnectionString");
                using (var connection1 = new SqlConnection(connectionString1))
                {
                    HttpContext.Session.SetString("IsMainUserMasterLogin", "");
                    connection1.Open();
                    string query1 = $"Select * From EmployeeMaster Where MobileNo={UserID.Trim()}";
                    using (var command = new SqlCommand(query1, connection1))
                    {
                        command.Parameters.AddWithValue("@UserID", UserID.Trim());
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    HttpContext.Session.SetString("User","");
                                    HttpContext.Session.SetString("Code", reader["Code"].ToString());
                                    HttpContext.Session.SetString("EmployeeCard", reader["EmployeeCard"].ToString());
                                    HttpContext.Session.SetString("EmployeeName", reader["EmployeeName"].ToString());
                                    HttpContext.Session.SetString("Email", reader["Email"].ToString());
                                    HttpContext.Session.SetString("MobileNo", reader["MobileNo"].ToString());
                                    HttpContext.Session.SetString("EmployeeType", reader["EmployeeType"].ToString());
                                    HttpContext.Session.SetString("ServerDate", DateTime.Now.Date.ToString("yyyy-MM-dd"));
                                    HttpContext.Session.SetString("Role", reader["Role"].ToString());
                                    HttpContext.Session.SetString("IsFirstLogin", reader["IsFirstLogin"].ToString());
                                    IsFirstLogin1= reader["IsFirstLogin"].ToString();
                                }
                            }
                        }
                    }
                    connection1.Close();
                    return Json(new { success = true, message = "Login successful!", IsFirstLogin = IsFirstLogin1 });
                }
            }
            else
            {
                return Json(new { success = false, message = "Invalid credentials!", IsFirstLogin = "N" });
            }
            return Json(new { success = false, message = "Invalid credentials!", IsFirstLogin = "N" });
        }
        public bool LogInUser(string id, string password)
        {
            bool loginSuccess = false;
            string Pass = "";
            string connectionString = HttpContext.Session.GetString("ConnectionString");
            using (var connections = new SqlConnection(connectionString))
            {
                connections.Open();
                string query = $"SELECT * FROM EmployeeMaster WHERE MobileNo ='{id}' And Status='A'";
                using (var command = new SqlCommand(query, connections))
                {
                    command.Parameters.AddWithValue("@UserID", id.Trim());
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.HasRows)
                        {
                            while (reader.Read())
                            {
                                Pass = reader["Password"].ToString();
                            }
                        }
                    }
                }
                connections.Close();

                if (User != null)
                {
                    string Pw = Pass, EPw = CommonFunction.Encrypt(password, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
                    if (Pw == EPw)
                        loginSuccess = true;
                    else if (Pw == password)
                        loginSuccess = true;
                }
                return loginSuccess;
            }
        }
        public IActionResult ChangePassword()
        {
            return View();
        }
       
        [HttpPost]
        public async Task<IActionResult> ChangePassword(string ExistingPassword, string Password)
        {
            string connectionString = HttpContext.Session.GetString("ConnectionString");
            string UserId = HttpContext.Session.GetString("MobileNo");
            if (!string.IsNullOrEmpty(UserId))
            {
                using (IDbConnection conn = new SqlConnection(connectionString))
                {
                    var parameters = new DynamicParameters();
                    parameters.Add("ExistingPassword", CommonFunction.Encrypt(ExistingPassword.Trim(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
                    parameters.Add("Password", CommonFunction.Encrypt(Password.Trim(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
                    parameters.Add("UserId", UserId);

                    var user = await conn.QueryAsync<dynamic>("USP_ChangePassword", parameters, commandType: CommandType.StoredProcedure);

                    return Json(user);
                }
            }
            else
            {
                return Json("[{Msg='',Status='N'}]");
            }
        }
        
    }
}
