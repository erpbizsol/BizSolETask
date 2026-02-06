using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices.Marshalling;

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
        public IActionResult PendingTask()
        {
            return View();
        }
        public IActionResult PendingTaskReport()
        {
            return View();
        }
        public IActionResult EmployeeAttandance()
        {
            return View();
        }
        public IActionResult TicketsRatingPending()
        {
            return View();
        }
        public IActionResult Configuration()
        {
            return View();
        }
        public IActionResult HolidayMaster()
        {
            return View();
        }
        public IActionResult TaskNatureMaster()
        { 
            return View();

        }
        public IActionResult TicketsPlanning()
        {
            return View();

        }
        public IActionResult TicketsRating()
        {
            return View();
        }

    }
}
