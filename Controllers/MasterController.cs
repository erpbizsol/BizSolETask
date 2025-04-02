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
    }
}
