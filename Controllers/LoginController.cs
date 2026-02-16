using Bizsol_ESMS.Models;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Exchange.WebServices.Data;
using Nancy.Json;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;
using System.Xml.Linq;
using static Bizsol_ETask.Controllers.LoginController;
using static System.Net.Mime.MediaTypeNames;
using static System.Net.WebRequestMethods;

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
                                Response.Cookies.Append("ETaskCompanyCode", CompanyCode, options);
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
        public IActionResult Authenticate(string CompanyCode, string UserID, string Password, string RememberMe)
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
                    return Ok(new { success = true, message = "Login successful!", IsFirstLogin = 'N' });
                }
            }
            else if (LogInUser(UserID, Password))
            {
                string connectionString1 = HttpContext.Session.GetString("ConnectionString");
                using (var connection1 = new SqlConnection(connectionString1))
                {
                    HttpContext.Session.SetString("IsMainUserMasterLogin", "");
                    connection1.Open();
                    string query1 = $"Select * From EmployeeMaster Where MobileNo='{UserID.Trim()}'";
                    using (var command = new SqlCommand(query1, connection1))
                    {
                        command.Parameters.AddWithValue("@UserID", UserID.Trim());
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    HttpContext.Session.SetString("User", "");
                                    HttpContext.Session.SetString("Code", reader["Code"].ToString());
                                    HttpContext.Session.SetString("EmployeeCard", reader["EmployeeCard"].ToString());
                                    HttpContext.Session.SetString("EmployeeName", reader["EmployeeName"].ToString());
                                    HttpContext.Session.SetString("Email", reader["Email"].ToString());
                                    HttpContext.Session.SetString("MobileNo", reader["MobileNo"].ToString());
                                    HttpContext.Session.SetString("EmployeeType", reader["EmployeeType"].ToString());
                                    HttpContext.Session.SetString("ServerDate", DateTime.Now.Date.ToString("yyyy-MM-dd"));
                                    HttpContext.Session.SetString("Role", reader["Role"].ToString());
                                    HttpContext.Session.SetString("IsFirstLogin", reader["IsFirstLogin"].ToString());
                                    IsFirstLogin1 = reader["IsFirstLogin"].ToString();
                                }
                            }
                        }
                    }
                    connection1.Close();
                    var options = new CookieOptions
                    {
                        Expires = DateTime.UtcNow.AddHours(9),
                        HttpOnly = false,
                        Secure = true,
                        SameSite = SameSiteMode.Strict
                    };

                    Response.Cookies.Append("autoSession", Uri.EscapeDataString(UserID.ToString()), options);

                    if (Request.Cookies.ContainsKey("cookIsContinuousTicket"))
                    {
                        Response.Cookies.Delete("cookIsContinuousTicket");
                    }

                    string rememberMeValue = Uri.EscapeDataString(CompanyCode + "()" + UserID + "()" + Password);

                    var rememberMeOptions = new CookieOptions
                    {
                        Expires = RememberMe == "Y" ? DateTime.UtcNow.AddMonths(6) : DateTime.UtcNow.AddMonths(-6),
                        HttpOnly = false,
                        Secure = true,
                        SameSite = SameSiteMode.Strict
                    };

                    Response.Cookies.Append("ETaskIsRememberMe", rememberMeValue, rememberMeOptions);

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
        [HttpPost]
        public async Task<IActionResult> SendOTP(string CompanyCode, string UserId)
        {
            string connectionString = HttpContext.Session.GetString("ConnectionString");
            string MobileNo = ""; string Email = ""; string EmployeeName = "";
            dynamic obj = "";
            using (var connections = new SqlConnection(connectionString))
            {

                connections.Open();
                string query = $"SELECT EmployeeName,EmployeeCard,Email,MobileNo From EmployeeMaster WHERE MobileNo ='{UserId}' And Status='A'";
                using (var command = new SqlCommand(query, connections))
                {
                    command.Parameters.AddWithValue("@UserID", UserId.Trim());
                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.HasRows)
                        {
                            while (reader.Read())
                            {

                                MobileNo = reader["MobileNo"].ToString();
                                Email = reader["Email"].ToString();
                                EmployeeName = reader["EmployeeName"].ToString();
                            }
                        }
                    }
                }
                connections.Close();
            }
            if (MobileNo != "" && Email != "" && EmployeeName != "")
            {
                string Otp;
                if (HttpContext.Session.GetString("OTP") != null)
                    Otp = HttpContext.Session.GetString("OTP").ToString();
                else
                {
                    Random r = new Random();
                    Otp = r.Next(1000, 9999).ToString();
                    HttpContext.Session.SetString("OTP", Otp);
                }
                HttpContext.Session.SetString("ReferralUserCode", MobileNo);

                string Msg = "<div style=\"background:#feef54;width:100%;padding:50px 0px;\"><div style=\"width:600px;background:white;margin:0px auto;\"><div style=\"width:40px;margin-left: 40px;padding-top:0px;\"></div><br><div style=\"padding:20px;padding: 40px;font-size: 12px;line-height: 22px;\">Dear <strong>" + EmployeeName + "</strong>,<br/><br/> We have received a request for password reset for your account :<strong>" + MobileNo + "</strong> <br>Your login password reset OTP :  <strong>   " + Otp + "</strong> <br/><br/>Thanks for Contacting BizSol.<br><br><U>Regards</U><br/> Customer Support Team<br/> <br/> Email: <a href = 'mailto:support@bizsol.in' > support@bizsol.in</a> <br/>BizSol Technologies Pvt Ltd <br /></div></div></div>";

                bool Mail = SendEmailOTP(Email, "BizSol CRM - Password Reset OTP", Msg);
                if (Mail)
                {

                    string Text = "Password Reset OTP has been sent an your Registered Email Id " + Email.Substring(0, 2) + "xxxxxx" + Email.Substring(Email.Length - 2, 2) + "";
                    obj = new
                    {
                        Msg = Text,
                        Status = "Y",
                        Otp
                    };
                    return Json(obj);

                }
            }
            else
            {
                string Text = "Invalid Registered Email Id Or Mobile";
                obj = new
                {
                    Msg = Text,
                    Status = "N",
                    Otp = ""
                };
                return Json(obj);
            }
            obj = new
            {
                Msg = "Error found.!",
                Status = "N",
                Otp = ""
            };
            return Json(obj);
        }
        public bool SendEmailOTP(string Recepient, string Subject, string Msg)
        {
            try
            {
                bool sendMail = Convert.ToBoolean(_configuration["SendMail"]);
                if (!sendMail)
                    return false;

                System.Net.Mail.MailMessage m = new System.Net.Mail.MailMessage();

                if (Recepient.Contains(";"))
                {
                    var RecepientList = Recepient.Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var R in RecepientList)
                        m.To.Add(R);
                }
                else
                {
                    m.To.Add(Recepient);
                }

                m.From = new System.Net.Mail.MailAddress("support@bizsol.in", "BizSol");
                m.Body = Msg;
                m.Subject = Subject;
                m.IsBodyHtml = true;

                System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient
                {
                    EnableSsl = false,
                    Host = "mail.bizsol.in",
                    Port = 25,
                    DeliveryMethod = System.Net.Mail.SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new System.Net.NetworkCredential("support@bizsol.in", "BizSolSupport@2019")
                };

                client.Send(m);
                return true;
            }
            catch (Exception ex)
            {
                return true;
            }
        }
        public IActionResult ResetPassword()
        {
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> ResetPassword(string Password)
        {
            string connectionString = HttpContext.Session.GetString("ConnectionString");
            string UserId = HttpContext.Session.GetString("ReferralUserCode");
            if (!string.IsNullOrEmpty(UserId))
            {
                using (IDbConnection conn = new SqlConnection(connectionString))
                {
                    var parameters = new DynamicParameters();
                    parameters.Add("Password", CommonFunction.Encrypt(Password.Trim(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
                    parameters.Add("UserId", UserId);
                    var user = await conn.QueryAsync<dynamic>("USP_ResetPassword", parameters, commandType: CommandType.StoredProcedure);
                    return Json(user);
                }
            }
            else
            {
                return Json("[{Msg='',Status='N'}]");
            }
        }

        [HttpPost]
        public IActionResult ValidatePassword(string Password)
        {
            if (string.IsNullOrEmpty(Password))
            {
                return Json(new { success = false, message = "Company code is required!" });
            }
            string connectionString = _configuration.GetConnectionString("DefaultConnectionSQL");
            string ConnectionString1 = _configuration.GetConnectionString("ConnectionString");
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT * FROM ETaskCompanyConfiguration WHERE UniquePassword = @Password";
                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Password", Password);
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
                                Response.Cookies.Append("Password", Password, options);
                                ViewBag.CompanyLogin = true;
                                ViewBag.IsValidCompanyCode = false;
                                return Json(new { success = true, message = "Password is valid.", Password });
                            }
                        }
                        dr.Close();
                    }
                    connection.Close();
                    Response.Cookies.Delete("Password");
                }

                return Json(new { success = false, message = "Invalid Password!" });
            }
        }

        private string GetConnectionStringByCompanyCode(string companyCode)
        {
            if (string.IsNullOrWhiteSpace(companyCode))
                return null;

            // 1) Master DB ka connection (jahan ETaskCompanyConfiguration table hai)
            string masterConn = _configuration.GetConnectionString("DefaultConnectionSQL");

            // 2) Template connection string jisme placeholders hain: IP, DatabaseName, UserID, Password
            string templateConn = _configuration.GetConnectionString("ConnectionString");

            using (var connection = new SqlConnection(masterConn))
            {
                connection.Open();

                string query = "SELECT SQLIp, DataBaseName, DataBaseUser, DataBasePassword " +
                               "FROM ETaskCompanyConfiguration WHERE CompanyCode = @CompanyCode";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CompanyCode", companyCode);

                    using (var dr = command.ExecuteReader())
                    {
                        if (!dr.Read())
                            return null;
                        string cs = templateConn;
                        cs = cs.Replace("IP", dr["SQLIp"].ToString());
                        cs = cs.Replace("DatabaseName", dr["DataBaseName"].ToString());
                        cs = cs.Replace("UserID", dr["DataBaseUser"].ToString());
                        cs = cs.Replace("Password", dr["DataBasePassword"].ToString());

                        return cs;
                    }
                }
            }
        }
        public class TicketRatingViewModel
        {
            public string CompanyCode { get; set; }
            public string TicketNo { get; set; }
            public string CallTcketMaster_Code { get; set; }
            public string ClientEmail { get; set; }
            public string QueryDescription { get; set; }

            public int Rating { get; set; }
            public string Status { get; set; } 
            public string Remark { get; set; }
            public string Type { get; set; }  
            public bool AlreadyRated { get; set; }
            public string Message { get; set; }
            public int ClientName { get; set; }
        }

        [HttpGet]
        public IActionResult GetTicketRatingData(string companyCode, int code, string clientEmail, string type)
        {
            try
            {
                var companyConn = GetConnectionStringByCompanyCode(companyCode);
                if (companyConn == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid company code."
                    });
                }

                string ticketNoDb = null;
                string emailDb = null;
                string descriptionDb = null;
                int? ratingDb = null;
                string statusDb = null;

                using (var con = new SqlConnection(companyConn))
                {
                    con.Open();

                    string sql = @"
                SELECT TOP 1 
                       CT.UID,
                       UM.Email,
                       CT.Description,
                       CT.Status
                FROM CallTicketMaster CT
                LEFT JOIN UserMaster UM ON CT.BizSolUserMaster_Code = UM.Code
                WHERE CT.Code = @Code AND UM.Email = @Email";

                    using (var cmd = new SqlCommand(sql, con))
                    {
                        cmd.Parameters.AddWithValue("@Code", code);
                        cmd.Parameters.AddWithValue("@Email", clientEmail);

                        using (var rdr = cmd.ExecuteReader())
                        {
                            if (rdr.Read())
                            {
                                ticketNoDb = rdr["UID"].ToString();
                                emailDb = rdr["Email"].ToString();
                                descriptionDb = rdr["Description"].ToString();
                            }
                            else
                            {
                                return Json(new
                                {
                                    success = false,
                                    message = "Ticket not found."
                                });
                            }
                        }
                    }
                }

                int rating = 0;
                string status = "P";

                if (type == "Y")
                {
                    rating = 10;
                    status = "C";
                }
                else if (type == "N")
                {
                    rating = 0;
                    status = "P";
                }

                if (ratingDb.HasValue)
                    rating = ratingDb.Value;

                if (!string.IsNullOrEmpty(statusDb))
                    status = statusDb;

                return Json(new
                {
                    success = true,
                    message = "",
                    companyCode,
                    ticketNo = ticketNoDb,
                    clientEmail = emailDb,
                    queryDescription = descriptionDb,
                    status,
                    rating,
                    type
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Server error: " + ex.Message
                });
            }
        }
        private bool IsAjaxRequest()
        {
            return string.Equals(Request.Headers["X-Requested-With"], "XMLHttpRequest", StringComparison.OrdinalIgnoreCase);
        }

        public IActionResult TicketsRating()
        {
            return View();
        }
        [HttpPost]
        public IActionResult TicketsRating(TicketRatingViewModel model)
        {
            bool isAjax = IsAjaxRequest();
            if (model == null)
            {
                if (isAjax) return Json(new { success = false, message = "Invalid request. Form data missing." });
                model = new TicketRatingViewModel { Message = "Invalid request." };
                return View("~/Views/Master/TicketsRating.cshtml", model);
            }
            if (model.Type == "Y")
            {
                model.Rating = 10;
                model.Status = "C";
            }
            else if (model.Type == "N")
            {
                model.Rating = 0;
                model.Status = "P";
            }
            else
            {
                model.Rating = 10;
                model.Status = "0";
            }
            try
            {
                if (string.IsNullOrWhiteSpace(model.CompanyCode))
                {
                    model.Message = "Company code missing";
                    if (isAjax) return Json(new { success = false, message = model.Message });
                    return View("~/Views/Master/TicketsRating.cshtml", model);
                }

                var companyConn = GetConnectionStringByCompanyCode(model.CompanyCode);
                if (companyConn == null)
                {
                    model.Message = "Invalid company code.";
                    if (isAjax) return Json(new { success = false, message = model.Message });
                    return View("~/Views/Master/TicketsRating.cshtml", model);
                }
                using (var con = new SqlConnection(companyConn))
                {
                    con.Open();
                    int callTicketMasterCode = 0;
                    using (var cmdGetCode = new SqlCommand(
                    "SELECT TOP 1 Code FROM CallTicketMaster WHERE UID = @TicketNo", con))
                    {
                        cmdGetCode.Parameters.AddWithValue("@TicketNo", model.TicketNo ?? "");
                        var obj = cmdGetCode.ExecuteScalar();
                        if (obj == null)
                        {
                            model.Message = "Ticket not found.";
                            if (isAjax) return Json(new { success = false, message = model.Message });
                            return View("~/Views/Master/TicketsRating.cshtml", model);
                        }
                        callTicketMasterCode = Convert.ToInt32(obj);
                    }
                    string checkSql = @"
                    SELECT COUNT(1) 
                    FROM   TicketRatingDetail
                    WHERE  CallTicketMaster_Code = @CallTicketMaster_Code AND RatedByEmailID = @Email";
                    using (var checkCmd = new SqlCommand(checkSql, con))
                    {
                        checkCmd.Parameters.AddWithValue("@CallTicketMaster_Code", callTicketMasterCode);
                        checkCmd.Parameters.AddWithValue("@Email", model.ClientEmail ?? "");

                        int count = (int)checkCmd.ExecuteScalar();
                        if (count > 0)
                        {
                            model.AlreadyRated = true;
                            model.Message = "The rating for this ticket has already been submitted.";
                            if (isAjax) return Json(new { success = false, message = model.Message });
                            return View("~/Views/Master/TicketsRating.cshtml", model);
                        }
                    }
                    using (var saveCmd = new SqlCommand("USP_TicketRatingDetail", con))
                    {
                        saveCmd.CommandType = CommandType.StoredProcedure;

                        saveCmd.Parameters.AddWithValue("@Mode", "SaveDATA");
                        saveCmd.Parameters.AddWithValue("@Code", 0);
                        saveCmd.Parameters.AddWithValue("@CallTicketMaster_Code", callTicketMasterCode);
                        saveCmd.Parameters.AddWithValue("@StatusByClient", model.Status);
                        saveCmd.Parameters.AddWithValue("@ClientRemark", (object?)model.Remark ?? "");
                        saveCmd.Parameters.AddWithValue("@RatedByEmailID", model.ClientEmail ?? "");
                        saveCmd.Parameters.AddWithValue("@Rating", model.Rating);
                        saveCmd.Parameters.AddWithValue("@ManagerRating", 0);
                        saveCmd.Parameters.AddWithValue("@ClientCode", model.ClientName);
                        saveCmd.ExecuteNonQuery();
                    }
                }
                model.Message = "Rating send successfully.";
                if (isAjax) return Json(new { success = true, message = model.Message });
                return View("~/Views/Master/TicketsRating.cshtml", model);
            }
            catch (Exception ex)
            {
                model.Message = "Save error: " + ex.Message;
                if (isAjax) return Json(new { success = false, message = model.Message });
                return View("~/Views/Master/TicketsRating.cshtml", model);
            }
        }

    }
}
