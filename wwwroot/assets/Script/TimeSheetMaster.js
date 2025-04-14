var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    $("#ERPHeading").text("Time Sheet");
    GetEmployeeMasterList();
    GetDipatmentList();
    GetWorkTypeList();
    DatePicker();
    setupDateInputFormatting();
    addNewRow();
    $(document).on("change", ".txtfromHr, .txttoHr", function () {
        const row = $(this).closest("tr");
        calculateMinutesRow(row);
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
                let option = '<option value="0">Select</option>';
                $.each(response, function (key, val) {

                    option += '<option value="' + val.Code + '">' + val["EmployeeName"] + '</option>';
                });

                $('#ddlEmployeeName')[0].innerHTML = option;

                $('#ddlEmployeeName').select2({
                    width: '-webkit-fill-available'
                });
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
function GetWorkTypeList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypeList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let option = '<option value="">Select</option>';
                $('#txtddlWorkType_')[0].innerHTML = option;

                $('#txtddlWorkType_').select2({
                    width: '-webkit-fill-available'
                });
            } else {
                $('#txtddlWorkType_').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('.txtddlWorkType').empty();
        }
    });
}
function GetDipatmentList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetClientList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let option = '<option value="">Select</option>';
                $('#txtddlDipartment_')[0].innerHTML = option;

                $('#txtddlDipartment_').select2({
                    width: '-webkit-fill-available'
                });
            } else {
                $('#txtddlDipartment_').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('.txtddlDipartment').empty();
        }
    });
}
function populateDropdownsForRow(row) {
    // Populate Department dropdown
    $.ajax({
        url: `${appBaseURL}/api/Master/GetClientList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            let option = '<option value="">Select</option>';
            $.each(response, function (key, val) {
                option += `<option value="${val.Code}">${val.ClientName}</option>`;
            });
            const $deptDropdown = row.find('.txtddlDipartment');
            $deptDropdown.html(option).select2({
                width: '100%'
            });
        }
    });

    // Populate Work Type dropdown
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypeList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            let option = '<option value="">Select</option>';
            $.each(response, function (key, val) {
                option += `<option value="${val.Code}">${val.WorkType}</option>`;
            });
            const $workDropdown = row.find('.txtddlWorkType');
            $workDropdown.html(option).select2({
                width: '100%'
            });
        }
    });
}

function DatePicker(date) {
    const today = new Date();
    const defaultDate = date || formatDateToString(today); 

    $('#txtFromDate').val(defaultDate);
    $('#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('update', defaultDate);
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
function isRowComplete(row) {
    const inputs = row.querySelectorAll("input.mandatory");
    for (const input of inputs) {
        if (input.value.trim() === "") {
            input.focus();
            return false;
        }
    }
    return true;
}
function addNewRow() {
    let rowCount = 0;
    const table = document.getElementById("tblorderbooking").querySelector("tbody");
    const rows = table.querySelectorAll("tr");
    const lastRow = rows[rows.length - 1];

    if (rows.length > 0) {
        if (!isRowComplete(lastRow)) {
            alert("Please fill in all mandatory fields in the current row before adding a new row.");
        } else {
            rowCount = rows.length;
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
            <td><select class="txtddlDipartment mandatory form-control form-control-sm box_border" onfocus="focusblank(this);" id="txtddlDipartment_${rowCount}" autocomplete="off" maxlength="100" ></select></td>
            <td><input type="time"  class="txtfromHr box_border form-control form-control-sm text-right" id="txtfromHr_${rowCount}" autocomplete="off" maxlength="15" /></td>
            <td><input type="time" class="txttoHr box_border form-control form-control-sm text-right" id="txttoHr_${rowCount}" autocomplete="off" maxlength="15" /></td>
            <td><input type="text" class="txttimeInMinutes form-control form-control-sm box_border" placeholder="Time in Minutes" disabled id="txttimeInMinutes_${rowCount}"autocomplete="off" maxlength="15" ></td>
            <td><select class="txtddlWorkType mandatory form-control form-control-sm box_border" onfocus="focusblank(this);" id="txtddlWorkType_${rowCount}" autocomplete="off" maxlength="100" ></select></td>
            <td><input type="text" class="txtRemarks1 box_border form-control form-control-sm" id="txtRemarks1_${rowCount}" autocomplete="off" maxlength="200" /></td>
            <td><button class="btn btn-success btn-sm saveRow" title="Save"><i class="fa fa-save"></i></button>
            <button class="btn btn-danger btn-sm deleteRow" title="Delete"><i class="fa fa-trash-alt"></i></button>
            </td>
      `;
            table.appendChild(newRow);
        }
    } else {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><select class="txtddlDipartment mandatory form-control form-control-sm box_border" onfocus="focusblank(this);" id="txtddlDipartment_${rowCount}" autocomplete="off" maxlength="100" ></select></td>
            <td><input type="time"  class="txtfromHr box_border form-control form-control-sm text-right" id="txtfromHr_${rowCount}" autocomplete="off" maxlength="15" /></td>
            <td><input type="time" class="txttoHr box_border form-control form-control-sm text-right" id="txttoHr_${rowCount}" autocomplete="off" maxlength="15" /></td>
            <td><input type="text" class="txttimeInMinutes form-control form-control-sm box_border" placeholder="Time in Minutes" disabled id="txttimeInMinutes_${rowCount}"autocomplete="off" maxlength="15" ></td>
            <td><select class="txtddlWorkType mandatory form-control form-control-sm box_border" onfocus="focusblank(this);" id="txtddlWorkType_${rowCount}" autocomplete="off" maxlength="100" ></select></td>
            <td><input type="text" class="txtRemarks1 box_border form-control form-control-sm" id="txtRemarks1_${rowCount}" autocomplete="off" maxlength="200" /></td>
            <td><button class="btn btn-success btn-sm saveRow" title="Save"><i class="fa fa-save"></i></button>
            <button class="btn btn-danger btn-sm deleteRow" title="Delete"><i class="fa fa-trash-alt"></i></button>
            </td>
      `;
        table.appendChild(newRow);
        //GetWorkTypeList();
        //GetDipatmentList();
        populateDropdownsForRow(row);
    }
}

$(document).on("click", ".saveRow", function () {
    const row = $(this).closest("tr")[0];

    if (!isRowComplete(row)) {
        alert("Please fill all mandatory fields.");
        return;
    }
    Save();
});

$(document).on("click", ".deleteRow", function () {
    const row = $(this).closest("tr");
    const table = document.getElementById("tblorderbooking").querySelector("tbody");

    if (table.querySelectorAll("tr").length > 1) {
        row.remove();
    } else {
        alert("At least one row is required.");
    }
});
function Save() {
    const Code = $("#hftxtCode").val();
    const Remarks = $("#Remarks").val();
    const EmployeeName = $("#ddlEmployeeName").val();
    const Date = $("#txtFromDate").val();
    if (!EmployeeName) {
        toastr.error("Please select Employee Name!");
        $("#ddlEmployeeName").focus();
        return;
    }
    if (!Date) {
        toastr.error("Please select Date!");
        $("#txtFromDate").focus();
        return;
    }
    let validationFailed = false;
    const timeSheetDetails = [];
    $("#tblorderbooking tbody tr").each(function () {
        const row = $(this);
        const clientName = row.find(".txtddlDipartment").val();
        const fromHr = row.find(".txtfromHr").val() || "00:00";
        const toHr = row.find(".txttoHr").val() || "00:00";
        const timeinMinutes = parseInt(row.find(".txttimeInMinutes").val()) || 0;
        const workType = row.find(".txtddlWorkType").val();
        const remarks1 = row.find(".txtRemarks1").val() || "";
        if (!clientName) {
            toastr.error("Please select Department!");
            row.find(".txtddlDipartment").focus();
            validationFailed = true;
            return false;
        }
        if (!workType) {
            toastr.error("Please select Work Type!");
            row.find(".txtddlWorkType").focus();
            validationFailed = true;
            return false;
        }
        timeSheetDetails.push({
            clientName,
            fromHr,
            toHr,
            timeinMinutes,
            workType,
            remarks1
        });
    });
    if (validationFailed) return;
    const payload = {
        timeSheetMastre: {
            code: Code,
            employeeName: EmployeeName,
            date: Date, // Format: yyyy-MM-dd
            remarks: Remarks,
            userMaster_Code: UserMaster_Code,
        },
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
                addNewRow();
            } else {
                toastr.error(response.Msg);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred while saving the data.");
        }
    });
}
function ClearData() {
    $("#hftxtCode").val("0");
    $("#ddlEmployeeName").val("");
    $("#txtFromDate").val("");
    $("#Remarks").val("");
    $("#Orderdata").empty();
   
}
function calculateMinutesRow(row) {
    const fromTime = $(row).find(".txtfromHr").val();
    const toTime = $(row).find(".txttoHr").val();

    if (!fromTime || !toTime) return;

    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);

    const fromTotal = fromHours * 60 + fromMinutes;
    const toTotal = toHours * 60 + toMinutes;
    if (fromTotal > toTotal) {
        alert("From time cannot be greater than To time. Please select a valid time.");
        $(row).find(".txttimeInMinutes").val(""); 
        return; 
    }
    const diff = toTotal - fromTotal;
    $(row).find(".txttimeInMinutes").val(diff);

    calculateTotal();
}
function calculateTotal() {
    let total = 0;
    $(".txttotalMinutes").each(function () {
        const val = parseInt($(this).val(), 10);
        if (!isNaN(val)) total += val;
    });

    $(".txttotalMinutes").val(total.toFixed(2));
}
function focusblank(element) {
    $(element).val("");
}