using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Bizsol_ESMS.Models;

namespace Bizsol_ETask.Controllers
{
    public class CompanyController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IConfiguration _configurations;
        public CompanyController(IConfiguration configuration)
        {
            _configuration = configuration;
            _configurations = configuration;

        }

        [HttpPost]
        public async Task<IActionResult> CreateNewCompany(string CCode, string EmployeeName, string Email, string MobileNo,string? Password)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnectionSQL");
            using (IDbConnection conn = new SqlConnection(connectionString))
            {
                var parameters = new DynamicParameters();
                parameters.Add("@CompanyCode", CCode);
                parameters.Add("@EmployeeName ", EmployeeName);
                parameters.Add("@Email", Email);
                parameters.Add("@MobileNo", MobileNo);
                parameters.Add("@Password",CommonFunction.Encrypt((Password ?? "").Trim(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"));
                parameters.Add("@QueryFilePath ", "C:\\ANTU_Etask_Script.txt");

                var result = await conn.QueryAsync<dynamic>("Usp_CreateDatabase_test", parameters, commandType: CommandType.StoredProcedure);
                return Json(result);
            }
        }
    }
}
