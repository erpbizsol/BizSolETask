using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Bizsol_ETask.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IConfiguration _configuration;
        public DashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult Dashboard()
        {
            string newconnectionStrings = HttpContext.Session.GetString("ConnectionString");
            string UserMaster_Code = HttpContext.Session.GetString("UserMaster_Code");
            string UserID = HttpContext.Session.GetString("MobileNo");
            string UserName = HttpContext.Session.GetString("EmployeeName");
            string UserType = HttpContext.Session.GetString("EmployeeType");

            var authKey = new
            {
                ConnectionSql = newconnectionStrings,
                AuthToken = "xyz",
                UserMaster_Code,
                UserID,
                UserType
            };

            string jsonAuthKey = JsonSerializer.Serialize(authKey);
            ViewBag.AppBaseURL = _configuration["AppBaseURL"];
            ViewBag.AppBaseURLMenu = _configuration["AppBaseURLMenu"];
            ViewBag.UserName = UserName;
            ViewBag.AuthKey = jsonAuthKey;
            return View();
        }
    }
}
