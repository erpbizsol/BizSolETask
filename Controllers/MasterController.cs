using Microsoft.AspNetCore.Mvc;

namespace Bizsol_ETask.Controllers
{
    public class MasterController : Controller
    {
        public IActionResult EmployeeMaster()
        {
            return View();
        }
        public IActionResult StatusMaster()
        {
            return View();
        }
        public IActionResult WorkTypeMaster()
        {
            return View();
        }
        public IActionResult EmployeeRatePerDetails()
        {
            return View();
        }
        public IActionResult ClientMaster()
        {
            return View();
        }
        public IActionResult TimeSheetMaster()
        {
            return View();
        }
        public IActionResult TimeSheetReport()
        {
            return View();
        }

        public IActionResult GenerateTask() 
        {
            return View();
        }
    }
}
