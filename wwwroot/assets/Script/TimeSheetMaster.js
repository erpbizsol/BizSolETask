var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_DepartmentList = [];
let G_WorkTypeList = [];
let G_TimeSheetMaster_Code = 0;
let G_Remark_Code = 0;
let highlightedDates = [];
$(document).ready(async function () {
    DatePicker();
    $("#ERPHeading").text("Time Sheet");
    await GetEmployeeMasterList();
    await GetWorkTypeList();
    setupDateInputFormatting();
    if (UserTypes === "A") {
        $("#ddlEmployeeName").prop('disabled', false);
        
    } else {
        $("#ddlEmployeeName").prop('disabled', true);
        GetDepartmentList(UserName);
    }
    GetDepartmentList(UserName);
    $('#ddlEmployeeName').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtFromDate").focus();
        }
    });
    $("#ddlEmployeeName,#txtFromDate").on("change", function () {
        document.getElementById("footerTotalMinutes").textContent = 0;
        document.getElementById("footerTotalMinutes1").textContent = 0;
        document.getElementById("footerTotalMinutes2").textContent = 0;
        GetEmpDateList();
        ClearData();
    });
    $("#ddlEmployeeName").on("change", function () {
        GetDate();
    });
    $("#ManualTimeCheckDefault").on("change", function () {
        GetEmpDateList();
    });
    
});
function NumericValue(e) {
    if (/\D/g.test(e.value)) e.value = e.value.replace(/[^0-9]/g, '')
}
function GetDate() {
    const emp = $('#ddlEmployeeName').val();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetDate?EmployeeName=${emp}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                const dateArray = response.map(item => item.EntryDate);
                const formattedDates = dateArray;
                highlightedDates = formattedDates;
                $('#txtFromDate').datepicker('refresh');
               
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);

    $('#txtFromDate').val(defaultDate);
    $('#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true,
        endDate: today,
        beforeShowDay: function (date) {
            const formatted = formatDateToString(date);
            if (highlightedDates.includes(formatted)) {
                return {
                    classes: 'highlighted-date',
                    tooltip: 'Data exists'
                };
            }
            return true;
        }
    }).on('changeDate', function (e) {
        const selectedDate = e.date;
        const now = new Date();

        // Reset time to 00:00:00 for comparison
        selectedDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        if (selectedDate > now) {
            alert("Future date not allowed!");
            $('#txtFromDate').datepicker('update', defaultDate);
        }
    });
}
function GetEmployeeMasterList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeMaster?IsActive=A&EmployeeType=`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let option = '<option value="0">Select</option>';
                $.each(response, function (key, val) {

                    option += '<option value="' + val.Code + '">' + val["EmployeeName"] + '</option>';
                });
                $('#ddlEmployeeName')[0].innerHTML = option;
                $('#ddlEmployeeName').select2({
                    width: '-webkit-fill-available'
                });
                SelectOptionByText('ddlEmployeeName', UserName);
               let selectedCode = $('#ddlEmployeeName').val();
                if (UserTypes !== "A") {
                    GetDepartmentList(selectedCode);
                    GetEmpDateList();
                   // BindSelect2(`txtddlDipartment_${item.Code}`, G_DepartmentList);
                   // $(`#txtddlDipartment_${item.Code}`).val(item.ClientMaster_Code).select2({ width: '100%' });
                }
               
            } else {
                $('#ddlEmployeeName').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#ddlEmployeeName').empty();
        }
    });
}
async function GetDepartmentList(EmployeeName) {
    try {
        const response = await fetch(`${appBaseURL}/api/Master/GetClientList?EmployeeName=${encodeURIComponent(EmployeeName)}`, {
            method: 'GET',
            headers: {
                'Auth-Key': authKeyData
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            G_DepartmentList = data.map(item => ({
                Code: item.Code,
                Name: item.ClientName
            }));
        } else {
            G_DepartmentList = [];
        }

    } catch (error) {
        console.error("Error fetching department list:", error);
        $('.txtddlDipartment').empty();
    }
}
function GetWorkTypeList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypeList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                G_WorkTypeList = response;
                G_WorkTypeList = G_WorkTypeList.map((item) => ({ Code: item.Code, Name: item['WorkType'] }));
                addNewRow();
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", error);
            $('.txtddlWorkType').html('<option value="0">Error loading data</option>');
        }
    });
}
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function setupDateInputFormatting() {
    $('#txtFromDate').on('input', function () {
        let value = $(this).val().replace(/[^\d]/g, '');

        if (value.length >= 2 && value.length < 4) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        } else if (value.length >= 4) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
        }
        $(this).val(value);

        if (value.length === 10) {
            validateDate(value);
        }
    });
}
function validateDate(value) {
    let regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    let isValidFormat = regex.test(value);

    if (isValidFormat) {
        let parts = value.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);

        let date = new Date(year, month - 1, day);

        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            $('#txtFromDate').val('');
        }
    } else {
        $('#txtFromDate').val('');
    }
}
$("#deleteRow").on("click", function () {
    const row = $(this).closest("tr");
    const table = document.getElementById("table").querySelector("tbody");

    if (table.querySelectorAll("tr").length > 1) {
        row.remove();
    } else {
        alert("At least one row is required.");
    }
});
function convertToDayMonthYear(dateStr) {

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (parseInt(month) < 1 || parseInt(month) > 12) return null;
    const monthName = months[parseInt(month) - 1];
    return `${day}-${monthName}-${year}`;
}
function addNewRow() {
    const table = document.getElementById("table");
    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");
    let isManualChecked = $('#ManualTimeCheckDefault').is(':checked') ? 'Y' : 'N';
    tableHead.innerHTML = '';
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th style="width:150px;">Department<span class="text-danger">*</span></th>`;

    if (isManualChecked === 'Y') {
        headerRow.innerHTML += `
            <th style="display:none;width:50px;">From Hr</th>
            <th style="display:none;width:50px;">To Hr</th>
            <th style="width:150px;">Time in Minutes</th>`;
    } else {
        headerRow.innerHTML += `
            <th style="width:50px;">From Hr</th>
            <th style="width:50px;">To Hr</th>
            <th style="width:150px;">Time in Minutes</th>`;
    }

    headerRow.innerHTML += `
        <th style="width:150px;">Work Type<span class="text-danger">*</span></th>
        <th style="width:150px;">Remarks</th>
        <th style="width:60px;">Action</th>`;
    tableHead.appendChild(headerRow);

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="txtddlDipartment mandatory form-control form-control-sm box_border"
                    id="txtddlDipartment_0" autocomplete="off" maxlength="50">
            </select>
        </td>`;

    if (isManualChecked === 'Y') {
        newRow.innerHTML += `
            <td style="display:none"><input id="txtfromHr_0" type="time" class="txtfromHr box_border form-control form-control-sm" autocomplete="off" maxlength="15" /></td>
            <td style="display:none"><input id="txttoHr_0" type="time" class="txttoHr box_border form-control form-control-sm" autocomplete="off" maxlength="15"/></td>
            <td><input id="txttimeInMinutes_0" type="text" class="txttimeInMinutes form-control form-control-sm box_border" onkeyup="NumericValue(this)" placeholder="Time in Minutes" autocomplete="off" maxlength="15"></td>`;
    } else {
        newRow.innerHTML += `
            <td><input id="txtfromHr_0" type="time" class="txtfromHr box_border form-control form-control-sm" autocomplete="off" maxlength="15" /></td>
            <td><input id="txttoHr_0" type="time" class="txttoHr box_border form-control form-control-sm" autocomplete="off" maxlength="15"/></td>
            <td><input id="txttimeInMinutes_0" type="text" class="txttimeInMinutes form-control form-control-sm box_border" onkeyup="NumericValue(this)" placeholder="Time in Minutes" disabled autocomplete="off" maxlength="15"></td>`;
    }

    newRow.innerHTML += `
        <td>
            <select class="txtddlWorkType mandatory form-control form-control-sm box_border"
                    id="txtddlWorkType_0" autocomplete="off" maxlength="50"> 
            </select>
        </td>
        <td><input type="text" id="txtRemarks1_0" class="txtRemarks1 box_border form-control form-control-sm" autocomplete="off" maxlength="500"/></td>
        <td style="text-align:center;">
            <button class="btn btn-success icon-height mb-1" title="Save" onclick="SaveData(0)">
                <i class="fas fa-save"></i>
            </button>
            <button class="btn btn-danger icon-height mb-1" id="deleteRow" title="Delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>`;
    tableBody.appendChild(newRow);

    BindSelect2('txtddlDipartment_0', G_DepartmentList);
    BindSelect2('txtddlWorkType_0', G_WorkTypeList);
}

async function GetEmpDateList() {
    const emp = $('#ddlEmployeeName').val();
    const rawDate = $('#txtFromDate').val();
    const formattedDate = convertToDayMonthYear(rawDate);
    let isManualChecked = $('#ManualTimeCheckDefault').is(':checked') ? 'Y' : 'N';

    try {
        const response = await fetch(`${appBaseURL}/api/Master/GetEmpDateList?EmployeeName=${encodeURIComponent(emp)}&WorkDate=${formattedDate}`, {
            method: 'POST',
            headers: {
                'Auth-Key': authKeyData
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        $("#table-body").empty();
        G_TimeSheetMaster_Code = 0;

        if (result.length > 0) {
            const StringFilterColumn = [];
            const NumericFilterColumn = [];
            const DateFilterColumn = [];
            const Button = false;
            const showButtons = [];
            const StringdoubleFilterColumn = [];
            let hiddenColumns = [];
            let Disabled = isManualChecked == 'Y' ? '' : 'disabled';
            if (isManualChecked === 'Y') {
                hiddenColumns = ["Code", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "Time (in Mins)", "Remarks1", "From Hr", "To Hr"];
            } else {
                hiddenColumns = ["Code", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "Time (in Mins)", "Remarks1"];
            }
            const ColumnAlignment = {
                "Department": 'left;width:15%',
                "From Hr": 'center;width: 25px',
                "To Hr": 'center;width: 25px',
                "Time in Minutes": 'center;width: 30px',
                "Work Type": 'left;width: 28%',
                "Remarks": 'left;width: 300px',
                "Action": 'center;width: 100px',
            };
            const updatedResponse = result.map(item => ({
                ...item,
                "Department": `
                <select class="txtddlDipartment mandatory form-control form-control-sm box_border"id="txtddlDipartment_${item.Code}" autocomplete="off" maxlength="50"></select>`,
                "From Hr": `<input type="time" autocomplete="off" id="txtfromHr_${item.Code}" class="txtfromHr form-control form-control-sm box_border" value="${item['From Hr']}" maxlength="15"/>`,
                "To Hr": `<input type="time" autocomplete="off" id="txttoHr_${item.Code}" class="txttoHr form-control form-control-sm box_border" value="${item['To Hr']}" maxlength="15"/>`,
                "Time in Minutes": `<input type="text" autocomplete="off" id="txttimeInMinutes_${item.Code}" class="txttimeInMinutes form-control form-control-sm box_border" ${Disabled} value="${item['Time in Minutes']}" maxlength="15"/>`,
                "Work Type": `<select class="txtddlWorkType mandatory form-control form-control-sm box_border" id="txtddlWorkType_${item.Code}" autocomplete="off" maxlength="50"></select>`,
                "Remarks": `<input type="text" autocomplete="off" id="txtRemarks1_${item.Code}" class="txtRemarks1 form-control form-control-sm box_border" value="${item.Remarks || ''}"/>`,
                "Action": `
                <button class="btn btn-success icon-height mb-1" title="Save" onclick="SaveData('${item.Code}')"><i class="fas fa-save"></i></button>
                <button class="btn btn-danger icon-height mb-1" title="Delete" onclick="Delete('${item.Code}','${item.TimeSheetMaster_Code}')"><i class="fa-solid fa-trash"></i></button>`
            }));
           

            $("#txtRemarks").val(result[0].Remarks1)
            G_TimeSheetMaster_Code = result[0].TimeSheetMaster_Code;
           
            const totalMinutes = result.reduce((sum, item) => sum + (parseInt(item["Time in Minutes"]) || 0), 0);
            document.getElementById("footerTotalMinutes").textContent = totalMinutes;

            BizsolCustomFilterGrid.CreateDataTable(
                "table-header",
                "table-body",
                updatedResponse,
                Button,
                showButtons,
                StringFilterColumn,
                NumericFilterColumn,
                DateFilterColumn,
                StringdoubleFilterColumn,
                hiddenColumns,
                ColumnAlignment,
                false
            );

            // Await department list before binding
            await GetDepartmentList(emp);

            // Bind department and work type dropdowns
            updatedResponse.forEach(item => {
                BindSelect2(`txtddlDipartment_${item.Code}`, G_DepartmentList);
                $(`#txtddlDipartment_${item.Code}`).val(item.ClientMaster_Code).select2({ width: '100%' });
            });

            updatedResponse.forEach(item => {
                BindSelect2(`txtddlWorkType_${item.Code}`, G_WorkTypeList);
                $(`#txtddlWorkType_${item.Code}`).val(item.WorkTypeMaster_Code).select2({ width: '100%' });
            });

            addNewRow();
            calculateTimeDifference(result.Code);
            GetDepartmentTable(result);
            GetWorktypeTable(result);
            G_Remark_Code = result[0].TimeSheetMaster_Code;
        
        } else {
            await GetDepartmentList(emp);
            addNewRow();
            $("#table-body1").empty();
            $("#table-body2").empty();
        }
    } catch (error) {
        console.error("Error loading employee date list:", error);
    }
}
function GetDepartmentTable(Data) {
    const StringFilterColumn = [];
    const NumericFilterColumn = [];
    const DateFilterColumn = [];
    const Button = false;
    const showButtons = [];
    const StringdoubleFilterColumn = [];
    const hiddenColumns = ["Code", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "Time in Minutes", "From Hr", "To Hr", "Work Type", "Remarks", "Remarks1"];
    const ColumnAlignment = {
    };
    let totalMinutes1 = Data.reduce((sum, item) => sum + (parseInt(item["Time (in Mins)"]) || 0), 0);
    BizsolCustomFilterGrid.CreateDataTable("table-header1", "table-body1", Data, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
    document.getElementById("footerTotalMinutes1").textContent = totalMinutes1;
    calculateTimeDifference(Data.Code);
}
function GetWorktypeTable(Data) {
    const StringFilterColumn = [];
    const NumericFilterColumn = [];
    const DateFilterColumn = [];
    const Button = false;
    const showButtons = [];
    const StringdoubleFilterColumn = [];
    const hiddenColumns = ["Code", "Department", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "From Hr", "To Hr", "Time in Minutes", "Remarks", "Remarks1"];
    const ColumnAlignment = {
    };
    let totalMinutes2 = Data.reduce((sum, item) => sum + (parseInt(item["Time (in Mins)"]) || 0), 0);
    BizsolCustomFilterGrid.CreateDataTable("table-header2", "table-body2", Data, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
    document.getElementById("footerTotalMinutes2").textContent = totalMinutes2;
    calculateTimeDifference(Data.Code);
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
$(document).on("change", "[id^='txtfromHr_'], [id^='txttoHr_']", function () {
    const code = this.id.split("_")[1];
    calculateTimeDifference(code);
    calculateTimeDifference1(code);

});
function calculateTimeDifference1(code) {
    const fromHr = $("#txtfromHr_" + code).val() || "00:00";
    const toHr = $("#txttoHr_" + code).val() || "00:00";

    if (fromHr === toHr) {
        toastr.warning("From Hr and To Hr cannot be the same.");
        $("#txttimeInMinutes_" + code).val("");
        return;
    }

}
function calculateTimeDifference(code) {
    const fromHr = $("#txtfromHr_" + code).val() || "00:00";
    const toHr = $("#txttoHr_" + code).val() || "00:00";

   
    const [fh, fm] = fromHr.split(":").map(Number);
    const [th, tm] = toHr.split(":").map(Number);
    const fromMinutes = fh * 60 + fm;
    const toMinutes = th * 60 + tm;

    if (toMinutes < fromMinutes) {
        toastr.warning("To Hr must be greater than From Hr or Equal!");
        $("#txttimeInMinutes_" + code).val("");
        return;
    }
   
    const diff = Math.max(0, toMinutes - fromMinutes);
    $("#txttimeInMinutes_" + code).val(diff);
}
function updateTotalMinutes() {
    let total = 0;
    $("input[id^='txttimeInMinutes_']").each(function () {
        const v = parseInt($(this).val(), 10);
        if (!isNaN(v)) total += v;
    });
    $("#footerTotalMinutes").text(total);
    $("#footerTotalMinutes1").text(total);
    $("#footerTotalMinutes2").text(total);
}
function convertToISO(dateStr) {
    let day, month, year;

    // Slash format: dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        [day, month, year] = dateStr.split("/");
    }
    // Already ISO? just normalize padding
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        [year, month, day] = dateStr.split("-");
    }
    else {
        console.error("convertToISO: unexpected format:", dateStr);
        return "";
    }

    // ensure two‑digit day/month
    day = day.padStart(2, "0");
    month = month.padStart(2, "0");

    return `${year}-${month}-${day}`;
}
function SaveData(Code) {
    let isManualChecked = $('#ManualTimeCheckDefault').is(':checked') ? 'Y' : 'N';
    const EmployeeName = $("#ddlEmployeeName").val();
    const Remarks = $("#Remarks").val();
    const FromDate = convertToISO($("#txtFromDate").val());
    const clientName = $("#txtddlDipartment_" + Code).val();
    const fromHr = $("#txtfromHr_" + Code).val() || "00:00";
    const toHr = $("#txttoHr_" + Code).val() || "00:00";
    const timeinMinutes = parseInt($("#txttimeInMinutes_" + Code).val()) || 0;
    const workType = $("#txtddlWorkType_" + Code).val();
    const remarks = $("#txtRemarks1_" + Code).val() || "";

    if (EmployeeName == '') {
        toastr.error("Please select Employee Name!");
        $("#ddlEmployeeName").focus();
        return;
    }
    else if (FromDate == '') {
        toastr.error("Please select Date!");
        $("#txtFromDate").focus();
        return;
    }
    else if (clientName == '0') {
        toastr.error("Please select Department!");
        $("#txtddlDipartment_" + Code).focus();
        return;
    }
    else if (isManualChecked == false) {
        if (fromHr == '00:00') {
            toastr.error("Please select from Hr!");
            $("#txtfromHr_" + Code).focus();
            return;
        }
        else if (toHr == '00:00') {
            toastr.error("Please select to Hr!");
            $("#txttoHr_" + Code).focus();
            return;
        }
    }
    else if (workType == '0') {
        toastr.error("Please select work Type!");
        $("#txtddlWorkType_" + Code).focus();
        return;
    }
    else {
        const timeSheetDetails = [{
            code: Code,
            clientMaster_Code: clientName,
            fromHr: fromHr,
            toHr: toHr,
            timeinMinutes: timeinMinutes,
            workTypeMaster_Code: workType,
            remarks: remarks

        }];

        const payload = {
            timeSheetMaster: [{
                code: G_TimeSheetMaster_Code,
                employeeName: EmployeeName,
                date: FromDate,
                remarks: Remarks,
                userMaster_Code: UserMaster_Code,
            }],
            TimeSheetDetail: timeSheetDetails
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveTimeSheetMaster`,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(payload),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Auth-Key", authKeyData);
            },
            success: function (response) {
                if (response[0].Status === "Y") {
                    toastr.success(response[0].Msg);
                    GetEmpDateList();
                }
                else {
                    toastr.error(response[0].Msg);
                }
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
            }
        });
    }
}
async function Delete(Code, TimeSheetMaster_Code) {
    if (confirm(`Are you sure you want to delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/Delete?Code=${TimeSheetMaster_Code}&TimeSheetDetail_Code=${Code}`,
            type: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    GetEmpDateList();
                } else {
                    toastr.error("Unexpected response format.");
                }
            },
            error: function (xhr, status, error) {
                toastr.error("Error deleting item:", Msg);

            }
        });
    }
}
$(document).on("focusout", "#txtRemarks", function () {
    const table = document.getElementById("table").querySelector("tbody");
    const rowCount = table.querySelectorAll("tr").length;

    if (rowCount > 1) {
        const row = $(this).closest("tr");
        const code = row.data("code");
        const remark = $(this).val();
        updateTimeSheetRemark(code, remark);
    } else {
        console.log("Only one row exists. Remark not updated.");
    }
});
async function updateTimeSheetRemark() {
    var Remarks = $("#txtRemarks").val();
    const response = await $.ajax({
        url: `${appBaseURL}/api/Master/TimeSheetRemark?Code=${G_Remark_Code}&Remark=${Remarks}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        }
    });

    if (response[0].Status === 'Y') {
        toastr.success(response[0].Msg);
      
    } else {
        toastr.error("Unexpected response format.");
    }

}
function ClearData() {
    $("#txtRemarks").val("");
}

$('#ManualTimeCheckDefault').on('change', function () {
    ShowHideFooter();
});

function ShowHideFooter() {
    let isManual = $('#ManualTimeCheckDefault').is(':checked');
    if (isManual === true) {
        $(".footerth").hide();
    } else {
        $(".footerth").show(); 
    }
}

