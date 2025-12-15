var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
const M = sessionStorage.getItem('AppBaseURLMenu');
let EmployeeMasterList = [];
let IsLoad = true;
let G_StatussList = [];
let G_ResolvedByList = [];
let G_ReAssignList = [];
let fileName;
let AttachmentDetail = [];
let G_Code;
let G_TaskNatureList = [];

$(document).ready(function () {
    GetStatuss();
    DatePicker();
    $("#ERPHeading").text("Tickets Planning");
    GetEmployeeMasterList();
    // Grid + popup Reason master ko pehle hi load kar lein
    GetReason();
    GetTaskNatureMaster();
    // GetEmployeeMasterLists('Load');
    GetCallTicketMasterPlanningDetails('Get');
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9.]/g, '')
    });
});

function GetEmployeeMasterList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssignedss`,
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
                    if (planDateVal && planDateVal !== 'dd-mm-yyyy') {
                        dateCls += ' input-filled';
                    }

                    var priCls = 'priority-input form-control form-control-sm';
                    if (planPriorityVal !== null && planPriorityVal !== undefined && String(planPriorityVal).trim() !== '') {
                        priCls += ' input-filled';
                    }

                    var planDateHtml = '<input type="date" class="' + dateCls + '" data-row="' + item.Code + '" value="' + planDateVal + '">';
                    var planPriorityHtml = '<input type="text" min="0" step="1" class="' + priCls + '" data-row="' + item.Code + '" value="' + planPriorityVal + '">';

                    // Assigned dropdown: editable only for admin users
                    var assignedDisabledAttr = isAdminUser ? '' : ' disabled';
                    var assignedHtml = '<select class="assigned-ddl" data-row="' + item.Code + '"' + assignedDisabledAttr + '>' + buildEmployeeOptions(assignedCode) + '</select>';

                    // Reason (Task Nature) dropdown: Assigned ke just baad dikhana hai
                    var reasonCode = 0;
                    var reasonText = '';

                    // Server se agar TaskNatureMaster_Code aa raha hai to usko hi primary source maanenge
                    if (item.TaskNatureMaster_Code !== null &&
                        item.TaskNatureMaster_Code !== undefined &&
                        item.TaskNatureMaster_Code !== 'null') {
                        var rc = parseInt(item.TaskNatureMaster_Code, 10);
                        if (!isNaN(rc) && rc > 0) {
                            reasonCode = rc;
                        }
                    }
                    // Nahi mila to Nature (text) se code nikaalne ki koshish karenge
                    if ((!reasonCode || reasonCode === 0) &&
                        item.Nature !== null && item.Nature !== undefined && item.Nature !== 'null') {
                        reasonText = String(item.Nature);
                        var fr = findReasonCodeByName(reasonText);
                        if (!isNaN(fr) && fr > 0) {
                            reasonCode = fr;
                        }
                    }

                    var reasonDisabledAttr = isAdminUser ? '' : ' disabled';
                    var reasonHtml = '<select class="TaskNature-ddl form-control form-control-sm" data-row="' + item.Code + '" data-TaskNature-code="' + String(reasonCode) + '" data-TaskNature-text="' + (reasonText || '') + '"' + reasonDisabledAttr + '>' + buildReasonOptions(reasonCode) + '</select>';

                    var RequiredPlanDiscussHtml = '<input type="checkbox" class="assigned-chk" data-row="' + item.Code + '"' + (isPlanDiscussChecked ? ' checked' : '') + ' />';

                    var timeVal = (item['Time Consumned(Hr)'] && item['Time Consumned(Hr)'] !== 'null') ? item['Time Consumned(Hr)'] : '0';
                    var timeHtml = '<a href="javascript:void(0)" class="time-link" data-uid="' + item.UID + '" data-code="' + item.Code + '">' + timeVal + '</a>';
                    var ActionEditNew = '<button class="btn btn-primary icon-height mb-1 btn1"  title="Edit" onclick="Edit(' + item['Code'] + ')"><i class="fa-solid fa-pencil"></i></button>';

                    // Naya object banayenge taki column order maintain rahe aur Reason ko Assigned ke bagal me la sake
                    var newItem = {};
                    var keys = Object.keys(item);
                    var i = 0;
                    while (i < keys.length) {
                        var key = keys[i];
                        if (key === 'Assigned') {
                            // Assigned ke turant baad Reason column inject karo
                            newItem[key] = assignedHtml;
                            newItem['Nature'] = reasonHtml;
                        } else if (key === 'Nature') {
                            // Server se aane wale plain text Reason ko ignore karein
                            // kyunki hum dropdown already add kar chuke hain
                        } else if (key === 'Plan Date') {
                            newItem[key] = planDateHtml;
                        } else if (key === 'Priority') {
                            newItem[key] = planPriorityHtml;
                        } else if (key === 'Dis') {
                            newItem[key] = RequiredPlanDiscussHtml;
                        } else if (key === 'Time Consumned(Hr)') {
                            newItem[key] = timeHtml;
                        } else if (key === 'Action') {
                            newItem[key] = ActionEditNew;
                        } else {
                            newItem[key] = item[key];
                        }
                        i = i + 1;
                    }

                    // Agar server se Assigned column nahi aaya to bhi ham apne columns add kar dein
                    if (!newItem.Assigned) {
                        newItem.Assigned = assignedHtml;
                        newItem.Reason = reasonHtml;
                    }
                    if (!newItem['Action']) {
                        newItem['Action'] = ActionEditNew;
                    }

                    return newItem;
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
function buildReasonOptions(selectedCode) {
    var html = '<option value="0">Select</option>';
    if (G_TaskNatureList && G_TaskNatureList.length > 0) {
        var i = 0;
        while (i < G_TaskNatureList.length) {
            var itm = G_TaskNatureList[i];
            var sel = '';
            if (!isNaN(parseInt(selectedCode, 10)) && parseInt(selectedCode, 10) === parseInt(itm.Code, 10)) {
                sel = ' selected';
            }
            html += '<option value="' + itm.Code + '"' + sel + '>' + itm.Name + '</option>';
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
function findReasonCodeByName(name) {
    if (!name) {
        return 0;
    }
    var n = String(name).toLowerCase().trim();
    if (!G_TaskNatureList || G_TaskNatureList.length === 0) {
        return 0;
    }
    var i = 0;
    while (i < G_TaskNatureList.length) {
        var itm = G_TaskNatureList[i];
        if (String(itm.Name).toLowerCase().trim() === n) {
            return parseInt(itm.Code, 10);
        }
        i = i + 1;
    }
    return 0;
}

$(document).on('change', '.assigned-ddl, .priority-input, .plan-date-input, .TaskNature-ddl', function () {

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

    // Hamesha row ka Code (ticket / planning row id) yahan store rakhenge
    var rowCode = parseInt(code, 10);
    var payload = { Code: rowCode };

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

    // Reason (Task Nature) optional – agar user ne select kiya hai to bhej denge
    if ($el.hasClass('TaskNature-ddl')) {
        var reasonVal = $el.val();
        if (reasonVal && reasonVal !== '0') {
            var rn = parseInt(reasonVal, 10);
            if (!isNaN(rn) && rn > 0) {
                // Row ka Code change nahi karna, alag field me Task Nature ka code bhejna hai
                payload.TaskNatureMaster_Code = rn;
                $el.attr('data-TaskNature-code', String(rn));
            }
        }
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

    var $reasonInRow = $row.find('.TaskNature-ddl');
    if ($reasonInRow && $reasonInRow.length > 0) {
        var rv = $reasonInRow.val();
        if (rv && rv !== '0') {
            var rnv = parseInt(rv, 10);
            if (!isNaN(rnv) && rnv > 0) {
                // Yahan bhi sirf Task Nature ka code hi bhejna hai
                payload.TaskNatureMaster_Code = rnv;
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
                    row.style.backgroundColor = '#63CEF8';
                }
            }
        }
    });
}

setInterval(Changecolor, 100);

function Edit(code) {
    $("#txtpage").show();
    $("#txtStatus").focus();
    G_Code = code;
    DatePicker();
}

$("#txtStatus").on('change', function () {
    var Status = $("#txtStatus").val();
    if (Status == "2") {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtResolvedBy1").show();
        $("#txtUpdateBy1").show();
        $("#txtAttachment1").show();
        $("#txtReAssign1").hide();
        $("#txtReason1").hide();
        GetResolvedBy();
        StatusType();

    } else if (Status == "4") {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtReAssign1").show();
        $("#txtAttachment1").show();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy1").hide();
        $("#txtReason1").show();
        StatusType();
        GetReAssign();
        GetReason();


    } else {
        $("#txtTotalResolutionM1").hide();
        $("#txtResolutionDate").hide();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy1").hide();
        $("#txtAttachment1").hide();
        $("#txtReAssign1").hide();
        $("#txtReason1").hide();
    }

});
function GetStatuss() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatuss`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtStatus');
            $select.empty();
            $.each(response, function (index, item) {
                $select.append(`<option value="${item.Code}">${item.StatusDescription}</option>`);
            });
            if (Array.isArray(response) && response.length > 0) {
                G_StatussList = response.map(item => ({
                    Code: item.Code,
                    Name: item.StatusDescription
                }));
            } else {
                G_StatussList = [];
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtStatus').empty();
        }
    });
}

function ViewAttachment(code) {
    blockUI();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAttachment?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const container = $('#attachmentContainer');
            container.empty();

            if (response && Array.isArray(response) && response.length > 0) {
                response.forEach(item => {
                    const fileName = item.AttachmentFileName;
                    const attachmentCode = item.Code;
                    const attachmentBase64 = item.Attachment; // base64 string

                    const row = `
                        <div class="attachment-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding: 10px 0;">
                            <a href="#" style="color: #007bff;" onclick="onAttachmentClick('${fileName}', '${attachmentBase64}','${attachmentCode}','Y')">${fileName}</a>
                        </div>
                    `;
                    container.append(row);
                });

                $('#attachmentModal').show();
                unblockUI();
            } else {
                container.append('<p>No attachments found.</p>');
                toastr.warning("No attachment found.");
                unblockUI();
            }
        },
        error: function () {
            toastr.error("Failed to retrieve attachments.");
            unblockUI();
        }
    });
}
function onAttachmentClick(fileName, base64Data, code, download) {
    let isOpen = false;

    // Remove data URL prefix if exists
    if (base64Data.startsWith("data:")) {
        base64Data = base64Data.split(',')[1];
    }
    // Decode Base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Infer MIME type
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
        txt: 'text/plain',
        png: 'image/png',
        gif: 'image/gif',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg'
    };
    const mimeType = mimeTypes[extension] || 'application/octet-stream';

    const blob = new Blob([byteArray], { type: mimeType });

    const viewableTypes = ['txt', 'png', 'gif', 'jpeg', 'jpg'];
    const url = URL.createObjectURL(blob);
    if (viewableTypes.includes(extension)) {
        const newTab = window.open();
        if (newTab) {
            newTab.document.write(`<img src="${url}" style="max-width: 50%; display: block; margin: auto;">`);
            newTab.document.close();
        } else {
            window.open(url, '_blank');
        }
        // Delay revoking to allow loading
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    } else {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
$("#txtBack").click(function () {
    $("#txtpage").hide();
    $("#txtTotalResolutionM1").hide();
    $("#txtResolutionDate").hide();
    $("#txtReAssign1").hide();
    $("#txtAttachment1").hide();
    $("#txtResolvedBy1").hide();
    $("#txtUpdateBy1").hide();
    $("#txtReason1").hide();


});
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function GetResolvedBy() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssignedss`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_ResolvedByList = response.map(item => ({
                    Code: item.Code,
                    Name: item.EmployeeName
                }));
            } else {
                G_ResolvedByList = [];
            }
            const $select = $('#txtResolvedBy');
            $select.empty();
            if (response && response.length > 0) {
                // $select.append(new Option("Select Assigned..", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.EmployeeName, item.Code));
                });
                EmployeeName = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Resolved By...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtResolvedBy').empty();
        }
    });
}
function GetReason() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetReason?EmployeeCode=${UserMaster_Code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_ReasonList = response.map(item => ({
                    Code: item.Code,
                    Name: item.Reason
                }));
            } else {
                G_ReasonList = [];
            }
            const $select = $('#txtReason');
            $select.empty();
            if (response && response.length > 0) {
                $select.append(new Option("Select Reason..", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.Reason, item.Code));
                });
                Reason = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Reason...",
                allowClear: true
            });

           
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtReason').empty();
        }
    });
}
function GetReAssign() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssignedss`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_ReAssignList = response.map(item => ({
                    Code: item.Code,
                    Name: item.EmployeeName
                }));
            } else {
                G_ReAssignList = [];
            }
            const $select = $('#txtReAssign');
            $select.empty();
            if (response && response.length > 0) {
                $select.append(new Option("Select Assigned..", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.EmployeeName, item.Code));
                });
                EmployeeName = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Resolved By...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtReAssign').empty();
        }
    });
}
function BindSelect2(elementId, list) {
    let option = '<option value="0">Select</option>';
    $.each(list, function (key, val) {

        option += '<option value="' + val.Code + '">' + val.Name + '</option>';
    });

    $('#' + elementId)[0].innerHTML = option;

    $('#' + elementId).select2({
        width: '100%'
    });
}
function StatusType() {
    var Status = $("#txtStatus").val();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatusType?Code=${G_Code}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {

                if (Status == "2") {
                    $("#txtTotalResolutionM").val(response[0].Times);
                    $("#txtResolutionDates").val(response[0].Dates);
                    $("#txtRemarks").val(response[0].Remarks);
                    $("#txtResolvedBy").val(response[0].Code);
                    $("#txtReAssign").val(response[0].Code);

                    response.forEach(item => {
                        BindSelect2(`txtResolvedBy`, G_ResolvedByList);
                        $(`#txtResolvedBy`).val(item.Code).select2({ width: '100%' });
                    });
                }
                else if (Status == "4") {
                    $("#txtTotalResolutionM").val(response[0].Times);
                    $("#txtResolutionDates").val(response[0].Dates);
                    $("#txtRemarks").val(response[0].Remarks);
                    $("#txtResolvedBy").val(response[0].Code);
                    $("#txtReAssign").val(response[0].Code);
                }

            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("Failed to fetch data. Please try again.");
        }
    });
}
$("#txtAttachment").on('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        fileName = files[0].name;
    }
});
$('#txtAttachment').bind('change', function () {
    $.each($('#txtAttachment')[0].files, function (key, file) {
        reduceFileSize(file, 500 * 1024, 1000, Infinity, 0.9, blob => {
            ConvertFileToByteArry(blob).then(function (ByteArray) {
                AttachmentDetail.push({
                    CallTicketMaster_Code: 0,
                    attachment: ByteArray,
                    attachmentFileName: fileName,
                });
            });

        });

    });
});
function ConvertFileToByteArry(File) {
    return new Promise(function (resolve, reject) {
        var fileByteArray = [];
        var reader = new FileReader();

        reader.readAsArrayBuffer(File);
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var arrayBuffer = evt.target.result,
                    array = new Uint8Array(arrayBuffer);
                for (var i = 0; i < array.length; i++) {
                    fileByteArray.push(array[i]);
                }
                resolve(fileByteArray);
            }
        }
    });
}
function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality, callback) {
    if (file.size <= acceptFileSize) {
        callback(file);
        return;
    }
    let img = new Image();
    img.onerror = function () {
        URL.revokeObjectURL(this.src);
        callback(file);
    };
    img.onload = function () {
        URL.revokeObjectURL(this.src);
        getExifOrientation(file, function (orientation) {
            let w = img.width, h = img.height;
            let scale = (orientation > 4 ?
                Math.min(maxHeight / w, maxWidth / h, 1) :
                Math.min(maxWidth / w, maxHeight / h, 1));
            h = Math.round(h * scale);
            w = Math.round(w * scale);

            let canvas = imgToCanvasWithOrientation(img, w, h, orientation);
            canvas.toBlob(function (blob) {
                console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
                callback(blob);
            }, 'image/jpeg', quality);
        });
    };
    img.src = URL.createObjectURL(file);
}
function getExifOrientation(file, callback) {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
        file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
        file = file.webkitSlice(0, 131072);
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) {
            callback(-2);
            return;
        }
        let length = view.byteLength, offset = 2;
        while (offset < length) {
            let marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    callback(-1);
                    return;
                }
                let little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                let tags = view.getUint16(offset, little);
                offset += 2;
                for (let i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        callback(view.getUint16(offset + (i * 12) + 8, little));
                        return;
                    }
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        callback(-1);
    };
    reader.readAsArrayBuffer(file);
}
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
    let canvas = document.createElement('canvas');
    if (orientation > 4) {
        canvas.width = rawHeight;
        canvas.height = rawWidth;
    } else {
        canvas.width = rawWidth;
        canvas.height = rawHeight;
    }

    if (orientation > 1) {
        console.log("EXIF orientation = " + orientation + ", rotating picture");
    }

    let ctx = canvas.getContext('2d');
    switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
    }
    ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
    return canvas;
}
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${day}-${monthAbbreviation}-${year}`;
}
function DatePicker() {
    const today = new Date();

    // Format today
    const defaultDate = formatDateToString(today);

    // set default values
    $('#txtResolutionDates,#txtToDate').val(defaultDate);

    // ResolutionDate & ToDate -> current date
    $('#txtResolutionDates,#txtToDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('setDate', today);

    // FromDate -> start from 1st of current month
    $('#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1)
    }).datepicker('setDate', new Date(today.getFullYear(), today.getMonth(), 1));
}
function Save() {
    let Status = $("#txtStatus").val();
    let TotalResolutionM = $("#txtTotalResolutionM").val();
    let ResolutionDates = convertDateFormat($("#txtResolutionDates").val());
    let ReAssign = $("#txtReAssign").val();
    let ResolvedBy = $("#txtResolvedBy").val();
    let UpdateBy = $("#txtUpdateBy").val();
    let Remarks = $("#txtRemarks").val();
    let Reason = $("#txtReason").val();
    if (Status == "") {
        toastr.error('Please select Status.');
        $("#txtStatus").focus();
        return;
    } else {
        let Postdata =
        {
            pendingTask: [
                {
                    code: parseInt(G_Code),
                    status: parseInt(Status),
                    ResolutionTime: parseInt(TotalResolutionM || 0),
                    resolutiondDate: ResolutionDates,
                    reAssign: ReAssign || 0,
                    resolvedBy: parseInt(ResolvedBy || 0),
                    updateBy: parseInt(UpdateBy || 0),
                    remarks: Remarks,
                    userMaster_Code: parseInt(UserMaster_Code || 0),
                    ReasonMaster_Code: Reason,
                }
            ],
            Attachment: AttachmentDetail
        };
        blockUI();
        $.ajax({
            url: `${appBaseURL}/api/Master/SavePendingTask`,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(Postdata),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Auth-Key", authKeyData);
            },
            success: function (response) {
                if (response[0].Status === "Y") {
                    toastr.success(response[0].Msg);
                    ClearData();
                    SendEmailMassage(response[0].Code);
                    GetCallTicketMasterPlanningDetails('Get');
                    $("#txtpage").hide();
                    unblockUI();
                }
                else if (response[0].Status === "N") {
                    toastr.error(response[0].Msg);
                    unblockUI();
                } else {
                    toastr.error(response.Msg);
                    unblockUI();
                }
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
                unblockUI();
            }
        });
    }
}
function ClearData() {
    $("#hftxtCode").val("0");
    $("#txtStatus").val("0").trigger('change');
    $("#txtTotalResolutionM").val("");
    // $("#txtResolutionDates").val("");
    $("#txtRemarks").val("");
    $("#txtReAssign").val("0").trigger('change');
    $("#txtResolvedBy").val("0").trigger('change');
    $("#txtUpdateBy").val('0').trigger('change');
    $("#txtReason1").val('0').trigger('change');
    DatePicker();
}

function updateSelected() {
    let selectedNames = $('.option:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#dropdownButton').val(selectedNames);
}
function GetEmpCodes() {
    let selectedCodes = [];
    $('.option:checked').each(function () {
        selectedCodes.push($(this).val());
    });

    return selectedCodes;
}

function SendEmailMassage(Code) {
    $.ajax({
        url: `${appBaseURL}/api/Email/SenEmailMassage?Code=${Code}&Mode=EDIT`,
        type: 'Get',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response[0].Status === 'Y') {
                //toastr.success(response[0].Msg);

            } else {
                toastr.error("Unexpected response format.");
            }
        },
        error: function (xhr, status, error) {
            toastr.error("Error deleting item:");
        }
    });
}
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
function GetTaskNatureMaster() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTaskNatureMaster`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_TaskNatureList = response.map(item => ({
                    Code: item.Code,
                    Name: item.Nature
                }));
            } else {
                G_TaskNatureList = [];
            }
            const $select = $('#txtTaskNature');
            $select.empty();
            if (response && response.length > 0) {
                $select.append(new Option("Select Task Nature..", "0", true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.Nature, item.Code));
                });
                Nature = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                //placeholder: "Select Work Type...",
                allowClear: true
            });
            // Grid ke saare Reason dropdown ko bhi refresh kar do (Assigned ke bagal)
            var $gridTaskNature = $('.TaskNature-ddl');
            if ($gridTaskNature && $gridTaskNature.length > 0) {
                $gridTaskNature.each(function () {
                    var $ddl = $(this);
                    var selCode = $ddl.attr('data-TaskNature-code');
                    var selText = $ddl.attr('data-TaskNature-text');
                    var selectedCode = 0;

                    if (selCode && selCode !== '0') {
                        selectedCode = parseInt(selCode, 10);
                        if (isNaN(selectedCode)) {
                            selectedCode = 0;
                        }
                    }

                    if ((!selectedCode || selectedCode === 0) && selText && selText !== '') {
                        var calc = findReasonCodeByName(selText);
                        if (!isNaN(calc) && calc > 0) {
                            selectedCode = calc;
                            $ddl.attr('data-TaskNature-code', String(calc));
                        }
                    }

                    $ddl.html(buildReasonOptions(selectedCode));
                    if (selectedCode && selectedCode > 0) {
                        $ddl.val(String(selectedCode));
                    }
                });
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtTaskNature').empty();
        }
    });
}