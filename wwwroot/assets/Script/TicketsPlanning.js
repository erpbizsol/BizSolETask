var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let EmployeeMasterList = [];

$(document).ready(function () {
    $("#ERPHeading").text("Tickets Planning");
    GetEmployeeMasterList();
    GetCallTicketMasterPlanningDetails('Get');
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9.]/g, '')
    });
});

function GetEmployeeMasterList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeMaster?IsActive=A&EmployeeType=`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {

                EmployeeMasterList = response; // store for grid dropdowns
                // Build dropdown options
                var option = '<option value="0">All</option>';
                $.each(response, function (key, val) {
                    option += '<option value="' + val.Code + '">' + val["EmployeeName"] + '</option>';
                });
                $('#ddlEmployeeName')[0].innerHTML = option;
                $('#ddlEmployeeName').select2({
                    width: '-webkit-fill-available'
                });
                // Resolve logged-in user's employee code
                var myCode = 0;
                if (authKeyData && authKeyData.UserMaster_Code) {
                    var n = parseInt(authKeyData.UserMaster_Code, 10);
                    if (!isNaN(n) && n > 0) {
                        myCode = n;
                    }
                }
                if (myCode === 0 && EmployeeMasterList && EmployeeMasterList.length > 0) {
                    var i = 0;
                    var uName = '';
                    if (UserName) {
                        uName = String(UserName).trim().toLowerCase();
                    }
                    while (i < EmployeeMasterList.length) {
                        var emp = EmployeeMasterList[i];
                        var empName = '';
                        if (emp.EmployeeName) {
                            empName = String(emp.EmployeeName).trim().toLowerCase();
                        }
                        if (empName === uName) {
                            var c = parseInt(emp.Code, 10);
                            if (!isNaN(c) && c > 0) {
                                myCode = c;
                            }
                            break;
                        }
                        i = i + 1;
                    }
                }
                // Identify admin
                var isAdmin = false;
                if (UserTypes) {
                    var ut = String(UserTypes).toUpperCase();
                    if (ut === 'A') {
                        isAdmin = true;
                    }
                }
                // Set default selection to logged-in employee
                if (myCode > 0) {
                    $('#ddlEmployeeName').val(String(myCode)).trigger('change');
                }
                // Lock dropdown for non-admins only
                if (!isAdmin) {
                    $('#ddlEmployeeName').prop('disabled', true);
                }
            } else {
                $('#ddlEmployeeName').empty();
            }
			// Auto load data for the logged-in user after employee list is ready
			GetCallTicketMasterPlanningDetails('Load');
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#ddlEmployeeName').empty();
        }
    });
}

$(document).on('click', '#btnSave', function () {
    GetCallTicketMasterPlanningDetails('Get');
});
$(document).on('change', '#ddlEmployeeName', function () {
    GetCallTicketMasterPlanningDetails('Get');
})

function GetCallTicketMasterPlanningDetails(Type) {

    var empVal = $('#ddlEmployeeName').val();
    var employeeCode = 0;
    if (empVal && empVal !== '' && !isNaN(parseInt(empVal, 10))) {
        employeeCode = parseInt(empVal, 10);
    }
   
    var yearVal = $('#yearSelect').val();
    var weekVal = $('#weekNumber').val();

    var year = '';
    if (yearVal && yearVal !== '') {
        year = yearVal;
    } else {
        var d = new Date();
        year = String(d.getFullYear()); // API requires Year → always send (fallback = current year)
    }

    var hasWeek = false;
    var weekNo = 0;
    if (weekVal && weekVal !== '' && !isNaN(parseInt(weekVal, 10))) {
        weekNo = parseInt(weekVal, 10);
        hasWeek = true;
    }

    var data = {
        EmployeeCode: employeeCode,
        Year: year 
    };
    if (hasWeek) {
        data.WeekNo = weekNo; // only include when user typed a week
    }

    $.ajax({
        url: `${appBaseURL}/api/Master/GetCallTicketMasterPlanningDetails`,
        type: 'GET',
        data: data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtTable").show();

                const StringFilterColumn = ["Client"];
                const NumericFilterColumn = ["UID"];
                const DateFilterColumn = ["LogDate"];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];

                const hiddenColumns = ["PCode","PlannedYear","PlanningMasterCode","StatusMaster_Code", "YearWeekNo", "MonthWeekNo", "Code", "ClientMaster_Code", "EmployeeName", "RaisedBy", "SecondLast_EmployeeMaster_Code"];
                const ColumnAlignment = {
                    'Time Consumned(Hr)': 'right'
                };

                // Identify admin once for row rendering (Assigned dropdown permission)
                var isAdminUser = false;
                if (UserTypes) {
                    var ut = String(UserTypes).toUpperCase();
                    if (ut === 'A') {
                        isAdminUser = true;
                    }
                }

                var updatedResponse = response.map(function (item) {

                    var ActionEdit = '';
                    ActionEdit = item['Action'];

                    var assignedCode = findEmployeeCodeByName(item.Assigned);

                    var planDateVal = '';
                    if (item['Plan Date'] && item['Plan Date'] !== 'null') {
                        planDateVal = item['Plan Date'];
                    }

                    var planPriorityVal = '';
                    if (item['Priority'] !== null && item['Priority'] !== undefined && item['Priority'] !== 'null') {
                        planPriorityVal = item['Priority'];
                    }
                    var planDiscussRaw = item['Dis'];
					var isPlanDiscussChecked = false;
					if (planDiscussRaw !== null && planDiscussRaw !== undefined && planDiscussRaw !== 'null') {
						var pd = String(planDiscussRaw).toLowerCase().trim();
						if (pd === 'y' || pd === 'yes' || pd === 'true' || pd === '1') {
							isPlanDiscussChecked = true;
						}
                    }
                    var dateCls = 'plan-date-input form-control form-control-sm';
                    if (planDateVal && planDateVal !== 'dd-mm-yyyy') { dateCls += ' input-filled'; }

                    var priCls = 'priority-input form-control form-control-sm';
                    if (planPriorityVal !== null && planPriorityVal !== undefined && String(planPriorityVal).trim() !== '') { priCls += ' input-filled'; }

                    var planDateHtml = '<input type="date" class="' + dateCls + '" data-row="' + item.Code + '" value="' + planDateVal + '">';
                    var planPriorityHtml = '<input type="text" min="0" step="1" class="' + priCls + '" data-row="' + item.Code + '" value="' + planPriorityVal + '">';

                    // Assigned dropdown: editable only for admin users
                    var assignedDisabledAttr = isAdminUser ? '' : ' disabled';
                    var assignedHtml = '<select class="assigned-ddl" data-row="' + item.Code + '"' + assignedDisabledAttr + '>' + buildEmployeeOptions(assignedCode) + '</select>';
					var RequiredPlanDiscussHtml = '<input type="checkbox" class="assigned-chk" data-row="' + item.Code + '"' + (isPlanDiscussChecked ? ' checked' : '') + ' />';

                    var timeVal = (item['Time Consumned(Hr)'] && item['Time Consumned(Hr)'] !== 'null') ? item['Time Consumned(Hr)'] : '0';
                    var timeHtml = '<a href="javascript:void(0)" class="time-link" data-uid="' + item.UID + '" data-code="' + item.Code + '">' + timeVal + '</a>';
                    var ActionEdit = '<button class="btn btn-primary icon-height mb-1 btn1"  title="Edit" onclick="Edit(' + item[`Code`] + ')"><i class="fa-solid fa-pencil"></i></button>'
                 
                    item.Assigned = assignedHtml;
                    item['Plan Date'] = planDateHtml;
                    item['Priority'] = planPriorityHtml;
                    item['Dis'] = RequiredPlanDiscussHtml;
                    item['Time Consumned(Hr)'] = timeHtml;
                    item['Action'] = ActionEdit;
                    return item;
                });
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
            } else {
                $("#txtTable").hide();
                if (Type != 'Load') {
                    toastr.error("Record not found...!");
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function buildEmployeeOptions(selectedCode) {
    var html = '<option value="0">Select</option>';
    if (EmployeeMasterList && EmployeeMasterList.length > 0) {
        var i = 0;
        while (i < EmployeeMasterList.length) {
            var emp = EmployeeMasterList[i];
            var sel = '';
            if (!isNaN(parseInt(selectedCode, 10)) && parseInt(selectedCode, 10) === parseInt(emp.Code, 10)) {
                sel = ' selected';
            }
            html += '<option value="' + emp.Code + '"' + sel + '>' + emp.EmployeeName + '</option>';
            i = i + 1;
        }
    }
    return html;
}
function findEmployeeCodeByName(name) {
    if (!name) {
        return 0;
    }
    var n = String(name).toLowerCase().trim();
    if (!EmployeeMasterList || EmployeeMasterList.length === 0) {
        return 0;
    }
    var i = 0;
    while (i < EmployeeMasterList.length) {
        var emp = EmployeeMasterList[i];
        if (String(emp.EmployeeName).toLowerCase().trim() === n) {
            return parseInt(emp.Code, 10);
        }
        i = i + 1;
    }
    return 0;
}

$(document).on('change', '.assigned-ddl, .priority-input, .plan-date-input', function () {

    // Require Year and Week before allowing row updates
    var yearVal = $('#yearSelect').val();
    if (!yearVal || yearVal === '0') {
        toastr.error('Please select year.');
        return;
    }

    var weekVal = $.trim($('#weekNumber').val());
    if (!weekVal || weekVal.length === 0) {
        toastr.error('Please enter week number.');
        return;
    }

    var weekNum = parseInt(weekVal, 10);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 53) {
        toastr.error('Please enter valid week number (1-53).');
        return;
    }

    var $el = $(this);
    var code = $el.attr('data-row');
    if (!code || code === '0') {
        toastr.error('Invalid row.');
        return;
    }

    var payload = { Code: parseInt(code, 10) };

    // Assigned is mandatory
    if ($el.hasClass('assigned-ddl')) {
        var assignedVal = $el.val();
        if (!assignedVal || assignedVal === '0') {
            toastr.error('Please select employee.');
            return;
        }

        var assignedNum = parseInt(assignedVal, 10);
        if (isNaN(assignedNum) || assignedNum === 0) {
            toastr.error('Please select employee.');
            return;
        }

        payload.AssignedEmployeeCode = assignedNum;
    }

    // Priority is optional; validate only if provided
    if ($el.hasClass('priority-input')) {
        var priVal = $el.val();
        var cleaned = '';
        var i = 0;

        while (priVal && i < priVal.length) {
            var ch = priVal.charAt(i);
            if (ch >= '0' && ch <= '9') {
                cleaned = cleaned + ch;
            }
            i = i + 1;
        }

        if (priVal !== cleaned) {
            $el.val(cleaned);
            priVal = cleaned;
        }

        if (priVal && priVal.length > 0) {
            var n = parseInt(priVal, 10);
            if (isNaN(n)) {
                toastr.error('Enter numeric priority.');
                return;
            }
            payload.PlanPriority = n;
        }
    }

    // Plan Date is optional; validate only if provided
    if ($el.hasClass('plan-date-input')) {
        var dateVal = $el.val(); // 'YYYY-MM-DD' or empty
        if (dateVal && dateVal.length > 0) {
            if (dateVal.length !== 10) {
                toastr.error('Select valid date.');
                return;
            }
            payload.PlanDate = dateVal;
        }
    }

    // Include other values from the same row if present.
    var $row = $el.closest('tr');

    // Enforce Assigned mandatory even when changing other fields
    var $assignedInRow = $row.find('.assigned-ddl');
    if ($assignedInRow && $assignedInRow.length > 0) {
        var av = $assignedInRow.val();
        if (!av || av === '0') {
            toastr.error('Please select employee.');
            return;
        }

        var an = parseInt(av, 10);
        if (isNaN(an) || an === 0) {
            toastr.error('Please select employee.');
            return;
        }

        payload.AssignedEmployeeCode = an;
    }

    var $dateInRow = $row.find('.plan-date-input');
    if ($dateInRow && $dateInRow.length > 0) {
        var dv = $dateInRow.val();
        if (dv && dv.length === 10) {
            payload.PlanDate = dv;
        }
    }

    var $priInRow = $row.find('.priority-input');
    if ($priInRow && $priInRow.length > 0) {
        var pv = $priInRow.val();
        if (pv && pv.length > 0) {
            var pn = parseInt(pv, 10);
            if (!isNaN(pn)) {
                payload.PlanPriority = pn;
            }
        }
    }

    var statusName = 4;
    if ($row.hasClass('reassigned')) {
        statusName = 4;
    }

    payload.StatusName = statusName;

    // Add Year and Week to payload
    payload.Year = yearVal;
    payload.WeekNo = weekVal;

    updateCallTicketPlanning(payload);
});

$(document).on('change', '.assigned-chk', function () {
    var $el = $(this);
    var code = $el.attr('data-row');
    if (!code || code === '0') {
        toastr.error('Invalid row.');
        return;
    }

    var isChecked = $el.is(':checked');
    var payload = { Code: parseInt(code, 10) };

    // Sirf Dis flag bhejo – koi Assigned / PlanDate / Priority / Year / WeekNo nahi
    payload.RequiredPlanDiscuss = isChecked ? 'Y' : 'N';

    updateCallTicketPlanning(payload, { sourceEl: this });

    // Visual: row ka colour change
    var $row = $el.closest('tr');
    if (isChecked) {
        $row.addClass('row-pending');
    } else {
        $row.removeClass('row-pending');
    }
});

function updateCallTicketPlanning(payload, opts) {
    var sourceEl = null;
    if (opts && opts.sourceEl) {
        sourceEl = opts.sourceEl;
    }

    $.ajax({
        url: `${appBaseURL}/api/Master/UpdateCallTicketMasterPlanning`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (resp) {
            var item = resp;

            if (Array.isArray(resp)) {
                if (resp.length > 0) {
                    item = resp[0];
                } else {
                    item = null;
                }
            }

            var ok = false;
            if (item && item.Status === 'Y') {
                ok = true;
            }

            if (ok) {
                if (item.Msg && item.Msg !== '') {
                    toastr.success(item.Msg);
                    GetCallTicketMasterPlanningDetails('Get');
                } else {
                    toastr.success('Updated');
                }

                var newStatus = null;
                if (item && item.NewStatusName && item.NewStatusName !== '') {
                    newStatus = item.NewStatusName;
                } else {
                    if (payload && payload.AssignedEmployeeCode !== null && payload.AssignedEmployeeCode !== undefined) {
                        if (item && item.StatusName) {
                            newStatus = item.StatusName;
                        }
                    }
                }

                if (sourceEl && newStatus && newStatus !== '') {
                    var $row = $(sourceEl).closest('tr');
                    var statusIndex = -1;

                    $('#table-header th').each(function (i) {
                        var t = $.trim($(this).text());
                        if (t === 'Status') {
                            statusIndex = i;
                        }
                    });

                    if (statusIndex >= 0) {
                        var $cells = $row.find('td');
                        if ($cells && $cells.length > statusIndex) {
                            $cells.eq(statusIndex).text(newStatus);
                        }
                    } else {
                        GetCallTicketMasterPlanningDetails('Get');
                    }
                } else {
                    GetCallTicketMasterPlanningDetails('Get');
                }
            } else {
                if (item && item.Msg && item.Msg !== '') {
                    toastr.error(item.Msg);
                } else {
                    toastr.error('Update failed');
                }
            }
        },
        error: function (xhr) {
            console.error('Update error:', xhr.responseText);
            toastr.error('Server error while updating.');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {

    var yearSelect = document.getElementById('yearSelect');
    var weekNumberInput = document.getElementById('weekNumber');
    var weekInfo = document.getElementById('weekInfo');
    var dateInput = document.getElementById('txtdate');

    populateYears(yearSelect);

    yearSelect.addEventListener('change', function () {

        if (yearSelect.value === '') {
            weekNumberInput.value = '';
            if (weekInfo) {
                weekInfo.textContent = '';
                weekNumberInput.setAttribute('placeholder', '');
            }
            return;
        }

        var selectedYear = parseInt(yearSelect.value, 10);
        var today = new Date();
        var monthIndex = today.getMonth();
        var day = today.getDate();

        var daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
        if (day > daysInMonth) {
            day = daysInMonth;
        }

        var dateInSelectedYear = new Date(selectedYear, monthIndex, day);

        // SQL-style week number for the date in the selected year
        var yWeek = getSqlServerWeek(dateInSelectedYear);
        weekNumberInput.value = String(yWeek);

        if (weekInfo) {
            var rng = getWeekRangeUS(dateInSelectedYear);
            var label = getMonthName(monthIndex) + ' ' + String(selectedYear) +
                ' - Week ' + String(yWeek) + ' (' + formatDM(rng.start) + ' - ' + formatDM(rng.end) + ')';
            weekInfo.textContent = label;
            weekNumberInput.setAttribute('placeholder', label);
        }
    });

    // Manual edit: typing a year-wise week number updates the info below
    weekNumberInput.addEventListener('input', function () {

        var digits = weekNumberInput.value.replace(/[^0-9]/g, '');
        if (digits !== weekNumberInput.value) {
            weekNumberInput.value = digits;
        }

        var selectedYear = parseInt(yearSelect.value, 10);
        if (isNaN(selectedYear)) {
            if (weekInfo) {
                weekInfo.textContent = '';
            }
            weekNumberInput.setAttribute('placeholder', '');
            return;
        }

        var n = parseInt(weekNumberInput.value, 10);
        if (isNaN(n) || n <= 0) {
            if (weekInfo) {
                weekInfo.textContent = '';
            }
            weekNumberInput.setAttribute('placeholder', '');
            return;
        }

        // Convert SQL week-of-year to a representative date, then show its range
        var repDate = getDateFromSqlWeek(selectedYear, n);
        if (!repDate) {
            if (weekInfo) {
                weekInfo.textContent = '';
            }
            weekNumberInput.setAttribute('placeholder', '');
            return;
        }

        var rng = getWeekRangeUS(repDate);
        var label = getMonthName(repDate.getMonth()) + ' ' + String(selectedYear) +
            ' - Week ' + String(n) + ' (' + formatDM(rng.start) + ' - ' + formatDM(rng.end) + ')';

        if (weekInfo) {
            weekInfo.textContent = label;
        }
        weekNumberInput.setAttribute('placeholder', label);
    });

    // When a specific working date is chosen, auto-calculate its SQL-style Year-wise Week No
    if (dateInput) {
        dateInput.addEventListener('change', function () {

            var val = dateInput.value; // 'YYYY-MM-DD'
            if (!val || val.length !== 10) {
                weekNumberInput.value = '';
                if (weekInfo) {
                    weekInfo.textContent = '';
                }
                weekNumberInput.setAttribute('placeholder', '');
                return;
            }

            var parts = val.split('-');
            if (!parts || parts.length !== 3) {
                weekNumberInput.value = '';
                if (weekInfo) {
                    weekInfo.textContent = '';
                }
                weekNumberInput.setAttribute('placeholder', '');
                return;
            }

            var y = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10);
            var d = parseInt(parts[2], 10);
            if (isNaN(y) || isNaN(m) || isNaN(d)) {
                weekNumberInput.value = '';
                if (weekInfo) {
                    weekInfo.textContent = '';
                }
                weekNumberInput.setAttribute('placeholder', '');
                return;
            }

            var selectedDate = new Date(y, m - 1, d);

            if (yearSelect) {
                yearSelect.value = String(y);
            }

            // SQL-style week number for the selected date
            var yWeek = getSqlServerWeek(selectedDate);
            weekNumberInput.value = String(yWeek);

            if (weekInfo) {
                var rng = getWeekRangeUS(selectedDate);
                var label = getMonthName(m - 1) + ' ' + String(y) +
                    ' - Week ' + String(yWeek) + ' (' + formatDM(rng.start) + ' - ' + formatDM(rng.end) + ')';
                weekInfo.textContent = label;
                weekNumberInput.setAttribute('placeholder', label);
            } else {
                weekNumberInput.setAttribute('placeholder', '');
            }
        });
    }
});

function getMonthName(index) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (index < 0) {
        index = 0;
    }
    if (index > 11) {
        index = 11;
    }
    return months[index];
}

function populateYears(selectEl) {
    while (selectEl.firstChild) {
        selectEl.removeChild(selectEl.firstChild);
    }

    var optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = 'Select';
    selectEl.appendChild(optDefault);

    var nowYear = new Date().getFullYear();
    var start = nowYear - 5;
    var end = nowYear + 5;
    var y = start;

    while (y <= end) {
        addOption(selectEl, String(y), String(y));
        y = y + 1;
    }
}

function addOption(selectEl, value, text) {
    var opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    selectEl.appendChild(opt);
}

// SQL Server DATEPART(WEEK, date) style (Sunday start, week 1 contains Jan 1)
function getSqlServerWeek(d) {
    var jan1 = new Date(d.getFullYear(), 0, 1);
    var msPerDay = 24 * 60 * 60 * 1000;
    var daysSinceJan1 = Math.floor((d - jan1) / msPerDay);
    var week = Math.floor((daysSinceJan1 + jan1.getDay()) / 7) + 1;
    return week;
}

// Get Sunday-Saturday range for a given date (US week)
function getWeekRangeUS(d) {
    var dow = d.getDay(); // 0=Sun..6=Sat
    var start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow);
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return { start: start, end: end };
}

// Given year and SQL week number, return a representative date in that week (Sunday)
function getDateFromSqlWeek(year, week) {
    if (!year || !week || week < 1) {
        return null;
    }
    var jan1 = new Date(year, 0, 1);
    // Sunday of week 1 is the Sunday on/before Jan 1
    var sundayOfWeek1 = new Date(jan1.getFullYear(), jan1.getMonth(), jan1.getDate() - jan1.getDay());
    var target = new Date(sundayOfWeek1.getFullYear(), sundayOfWeek1.getMonth(), sundayOfWeek1.getDate() + (week - 1) * 7);
    return target;
}

function formatDM(d) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()];
}

$(document).on('click', '.time-link', function () {
    var uid = $(this).data('uid');
    GetAssingData(uid);
});
function GetAssingData(TickatNo) {
    $.ajax({
        url: `${appBaseURL}/api/Master/DateWiseUserWiseTime?TickatNo=${TickatNo}`,
        type: 'GET',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = [];
                const ColumnAlignment = {
                };
                BizsolCustomFilterGrid.CreateDataTable("table-header1", "table-body1", response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
                $('#attachmentModal1').show();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}
function Changecolor() {
    var headerCells = document.querySelectorAll('#table-header th');
    var priorityIndex = -1;
    var dateIndex = -1;
    var planDiscussIndex = -1;
    var selectedEmpCode = '';
    var empSelect = document.getElementById('ddlEmployeeName');
    var highlightByAssigned = false;

    if (empSelect) {
        selectedEmpCode = empSelect.value;
        if (selectedEmpCode && selectedEmpCode !== '0') {
            highlightByAssigned = true;
        }
    }
    headerCells.forEach(function (th, i) {
        var text = '';
        if (th.textContent) {
            text = th.textContent.trim();
        }
        if (text === 'Priority') {
            priorityIndex = i;
        }
        if (text === 'Plan Date') {
            dateIndex = i;
        }
        if (text === 'Dis') {
            planDiscussIndex = i;
        }
    });

    var rows = document.querySelectorAll('#table-body tr');
    rows.forEach(function (row) {
        var cells = row.querySelectorAll('td');

        var priVal = '';
        if (priorityIndex >= 0 && cells.length > priorityIndex) {
            var priTd = cells[priorityIndex];
            var priInput = priTd.querySelector('input.priority-input');
            if (priInput && typeof priInput.value === 'string') {
                priVal = priInput.value.trim();
            } else {
                if (priTd.textContent) {
                    priVal = priTd.textContent.trim();
                }
            }
            if (priVal !== '') {
                priTd.style.backgroundColor = '#009358';
            } else {
                priTd.style.backgroundColor = '';
            }
        }

        var dateVal = '';
        if (dateIndex >= 0 && cells.length > dateIndex) {
            var dateTd = cells[dateIndex];
            var dateInput = dateTd.querySelector('input.plan-date-input');
            if (dateInput && typeof dateInput.value === 'string') {
                dateVal = dateInput.value.trim();
            } else {
                if (dateTd.textContent) {
                    dateVal = dateTd.textContent.trim();
                }
            }
            if (dateVal !== '') {
                dateTd.style.backgroundColor = '#009358';
            } else {
                dateTd.style.backgroundColor = '';
            }
        }

        // Row color based on date value (only when date has a value)
        if (dateVal !== '') {
            row.style.backgroundColor = '#9ef3a5';
        } else {
            row.style.backgroundColor = '';
        }

        // Yellow row when Plan Discuss is checked
        if (planDiscussIndex >= 0 && cells.length > planDiscussIndex) {
            var pdTd = cells[planDiscussIndex];
            var pdChk = pdTd.querySelector('input.assigned-chk');
            if (pdChk && pdChk.checked) {
                if (!row.classList.contains('row-pending')) {
                    row.classList.add('row-pending');
                }
            } else {
                if (row.classList.contains('row-pending')) {
                    row.classList.remove('row-pending');
                }
            }
        }

       
        if (highlightByAssigned) {
            // YAHAN getElementById nahi, querySelector use karein:
            var assignedSelect = row.querySelector('select.assigned-ddl');

            if (assignedSelect) {
                var rowEmpCode = assignedSelect.value;
                if (rowEmpCode && rowEmpCode !== selectedEmpCode) {
                    row.style.backgroundColor = '#4ba6ef';
                }
            }
        }
    });
}

setInterval(Changecolor, 100);

function Edit(code) {
    if (!code || code === 0) {
        toastr.error('Invalid ticket.');
        return;
    }

    // Yaha apna actual URL lagao jahan edit view hai:
    // Example: MVC route /Tickets/Edit?code=...
    var url = M + 'Master/PendingTask';

    // 1) Same tab me open karna ho:
    window.location.href = url;

    // 2) Agar naya tab me kholna ho to upar wali line hata ke ye use karo:
    // window.open(url, '_blank');
}
