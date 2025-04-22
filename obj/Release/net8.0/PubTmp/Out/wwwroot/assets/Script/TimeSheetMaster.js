var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_DepartmentList = [];
let G_WorkTypeList = [];

$(document).ready(function () {
    $("#ERPHeading").text("Time Sheet");
    GetEmployeeMasterList();
    GetDipatmentList();
    GetWorkTypeList();
    setupDateInputFormatting();
    //addNewRow();
    DatePicker();
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
function GetDipatmentList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetClientList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                G_DepartmentList = response;
                G_DepartmentList=G_DepartmentList.map((item) => ({ Code: item.Code, Name: item.ClientName }));
                //$('.txtddlDipartment').html(option);
                //if ($('.txtddlDipartment').length > 0) {
                //    $('.txtddlDipartment').select2({
                //        width: '100%'
                //    });
                //}
              //  addNewRow();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('.txtddlDipartment').empty();
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
$(document).on("click", "#deleteRow", function () {
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
$(document).on("change", '#ddlEmployeeName, #txtFromDate', function () {
    GetEmpDateList();
    GetEmpDateList1();
    GetEmpDateList2();
});
function addNewRow() {
    const table = document.getElementById("table");
    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");

    if (!tableHead.querySelector("tr")) {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
        <th>Department<span class="text-danger">*</span></th>
        <th>From Hr</th>
        <th>To Hr</th>
        <th>Time in Minutes</th>
        <th>Work Type<span class="text-danger">*</span></th>
        <th>Remarks</th>
        <th>Action</th>`;
        tableHead.appendChild(headerRow);
    }
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
       <td>
       <select class="txtddlDipartment mandatory form-control form-control-sm box_border"
        id="txtddlDipartment_0" autocomplete="off">
        </select>
        </td>
        <td><input id="txtfromHr_0" type="time" class="txtfromHr box_border form-control form-control-sm text-right" autocomplete="off" maxlength="15" /></td>
        <td><input id="txttoHr_0" type="time" class="txttoHr box_border form-control form-control-sm text-right" autocomplete="off" maxlength="15"/></td>
        <td><input id="txttimeInMinutes_0" type="text" class="txttimeInMinutes form-control form-control-sm box_border" placeholder="Time in Minutes" disabled autocomplete="off" maxlength="15"></td>
        <td><select class="txtddlWorkType mandatory form-control form-control-sm box_border"
        id="txtddlWorkType_0" autocomplete="off"> </select></td>
        <td><input type="text" id="txtRemarks1_0" class="txtRemarks1 box_border form-control form-control-sm" autocomplete="off" maxlength="200" /></td>
        <td>
         <button class="btn btn-success icon-height mb-1" title = "Edit" onclick="SaveData(0)"> <i class="fas fa-save"></i></button>
         <button class="btn btn-danger icon-height mb-1"  title="Delete" id="deleteRow"><i class="fa-solid fa-trash"></i></button>
        </td>`;
    tableBody.appendChild(newRow);
    BindSelect2('txtddlDipartment_0', G_DepartmentList);
    BindSelect3('txtddlWorkType_0', G_WorkTypeList);
}
function GetEmpDateList() {
    let emp = $('#ddlEmployeeName').val();
    let rawDate = $('#txtFromDate').val();
    let formattedDate = convertToDayMonthYear(rawDate);
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmpDateList?EmployeeName=${emp}&WorkDate=${formattedDate}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            $("#table-body").empty();
            if (response.length > 0) {
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "Time (in Mins)","Remarks1"];
                const ColumnAlignment = {
                };
                
                const updatedResponse = response.map(item => {
                    return {
                        ...item,
                        "Department": `
                        <select class="txtddlDipartment mandatory form-control form-control-sm box_border"
                        id="txtddlDipartment_${item.Code}" autocomplete="off">
                        </select>`,
                        "From Hr": `<input type="time" autocomplete="off" id="txtfromHr_${item.Code}" class="txtfromHr form-control form-control-sm box_border" value="${item['From Hr']}"/>`,
                        "To Hr": `<input type="time" autocomplete="off" id="txttoHr_${item.Code}" class="txttoHr form-control form-control-sm box_border" value="${item['To Hr']}"/>`,
                        "Time in Minutes": `<input type="text" autocomplete="off" id="txttimeInMinutes_${item.Code}" class="txttimeInMinutes form-control form-control-sm box_border" disabled value="${item['Time in Minutes']}"/>`,
                        "Work Type": `<select class="txtddlWorkType mandatory form-control form-control-sm box_border" id="txtddlWorkType_${item.Code}" autocomplete="off"></select>`,
                        "Remarks": `<input type="text" autocomplete="off" id="txtRemarks1_${item.Code}" class="txtRemarks1 form-control form-control-sm box_border" value="${item.Remarks || ''}"/>`,
                        "Action":
                        `<button class="btn btn-success icon-height mb-1" title="Edit" onclick="SaveData('${item.Code}')"><i class="fas fa-save"></i></button>
                         <button class="btn btn-danger icon-height mb-1" title="Delete" onclick="Delete('${item.TimeSheetMaster_Code}')"><i class="fa-solid fa-trash"></i></button>`
                        };
                });
                
                let totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time in Minutes"]) || 0), 0);
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
                document.getElementById("footerTotalMinutes").textContent = totalMinutes;

                updatedResponse.forEach(item => {
                    BindSelect2(`txtddlDipartment_${item.Code}`, G_DepartmentList);
                    $(`#txtddlDipartment_${item.Code}`).val(item.ClientMaster_Code)
                    $(`#txtddlDipartment_${item.Code}`).select2({
                        width: '100%'
                    });
                });
                updatedResponse.forEach(item => {
                    BindSelect3(`txtddlWorkType_${item.Code}`, G_WorkTypeList);
                    $(`#txtddlWorkType_${item.Code}`).val(item.WorkTypeMaster_Code)
                    $(`#txtddlWorkType_${item.Code}`).select2({
                        width: '100%'
                    });
                });
                addNewRow();
                calculateTimeDifference(response.Code);
            } else {
                addNewRow();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function GetEmpDateList1() {
    let emp = $('#ddlEmployeeName').val();
    let rawDate = $('#txtFromDate').val();
    let formattedDate = convertToDayMonthYear(rawDate);
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmpDateList?EmployeeName=${emp}&WorkDate=${formattedDate}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response1) {
            $("#table-body1").empty();
            if (response1.length > 0) {
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "Time in Minutes", "From Hr", "To Hr", "Work Type", "Remarks", "Remarks1"];
                const ColumnAlignment = {
                };
                let totalMinutes1 = response1.reduce((sum, item) => sum + (parseInt(item["Time (in Mins)"]) || 0), 0);
                BizsolCustomFilterGrid.CreateDataTable("table-header1", "table-body1", response1, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
                document.getElementById("footerTotalMinutes1").textContent = totalMinutes1;
                calculateTimeDifference(response1.Code);
            } else {
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function GetEmpDateList2() {
    let emp = $('#ddlEmployeeName').val();
    let rawDate = $('#txtFromDate').val();
    let formattedDate = convertToDayMonthYear(rawDate);
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmpDateList?EmployeeName=${emp}&WorkDate=${formattedDate}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response2) {
            $("#table-body2").empty();
            if (response2.length > 0) {
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code", "Department", "TimeSheetMaster_Code", "ClientMaster_Code", "WorkTypeMaster_Code", "From Hr", "To Hr", "Time in Minutes", "Remarks", "Remarks1"];
                const ColumnAlignment = {
                };
                let totalMinutes2 = response2.reduce((sum, item) => sum + (parseInt(item["Time (in Mins)"]) || 0), 0);
                BizsolCustomFilterGrid.CreateDataTable("table-header2", "table-body2", response2, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
                document.getElementById("footerTotalMinutes2").textContent = totalMinutes2;
                calculateTimeDifference(response2.Code);
            } else {
               
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function BindSelect2(elementId,list) {
    let option = '<option value="0">Select</option>';
    $.each(list, function (key, val) {

        option += '<option value="' + val.Code + '">' + val.Name + '</option>';
    });

    $('#' + elementId)[0].innerHTML = option;

    $('#' + elementId).select2({
           width: '100%'
      });
}
function BindSelect3(elementId, list) {
    let option = '<option value="0">Select</option>';
    $.each(list, function (key, val) {

        option += '<option value="' + val.Code + '">' + val.Name + '</option>';
    });

    $('#' + elementId)[0].innerHTML = option;

    $('#' + elementId).select2({
        width: '100%'
    });
}
function calculateTimeDifference(code) {
    const fromHr = $("#txtfromHr_" + code).val() || "00:00";
    const toHr = $("#txttoHr_" + code).val() || "00:00";
    const [fh, fm] = fromHr.split(":").map(Number);
    const [th, tm] = toHr.split(":").map(Number);

    const fromMinutes = fh * 60 + fm;
    const toMinutes = th * 60 + tm;

    // prevent negative
    const diff = Math.max(0, toMinutes - fromMinutes);

    $("#txttimeInMinutes_" + code).val(diff);
    $("#footerTotalMinutes" + code).text(diff);
    $("#footerTotalMinutes1" + code).text(diff);
    $("#footerTotalMinutes2" + code).text(diff);
    updateTotalMinutes();
}
function updateTotalMinutes() {
    let total = 0;
    $("input[id^='txttimeInMinutes_']").each(function () {
        const v = parseInt($(this).val(), 10);
        if (!isNaN(v)) total += v;
    });

    // write into your footer cell
    $("#footerTotalMinutes").text(total);
    $("#footerTotalMinutes1").text(total);
    $("#footerTotalMinutes2").text(total);
}
$(document).on("change", "[id^='txtfromHr_'], [id^='txttoHr_']", function () {
    const code = this.id.split("_")[1];
    calculateTimeDifference(code);
    updateTotalMinutes();
});
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
    const EmployeeName = $("#ddlEmployeeName").val();
    const Remarks = $("#Remarks").val();
    const Date = convertToISO($("#txtFromDate").val());
    const clientName = $("#txtddlDipartment_" + Code).val();
    const fromHr = $("#txtfromHr_" + Code).val() || "00:00";
    const toHr = $("#txttoHr_" + Code).val() || "00:00";
    const timeinMinutes = parseInt($("#txttimeInMinutes_" + Code).val()) || 0;
    const workType = $("#txtddlWorkType_" + Code).val();
    const remarks1 = $("#txtRemarks1_" + Code).val() || "";

    if (!EmployeeName) {
        toastr.error("Please select Employee Name!");
        $("#ddlEmployeeName").focus();
        return;
    }
    else if (!Date) {
        toastr.error("Please select Date!");
        $("#txtFromDate").focus();
        return;
    }
    else if (!clientName) {
        toastr.error("Please select Department!");
        $("#txtddlDipartment_" + Code).focus();
        return;
    }
    else if (!workType) {
        toastr.error("Please select work Type!");
        $("#txtddlWorkType_" + Code).focus();
        return;
    }
    else {
        const timeSheetDetails = [{
            clientName: clientName,
            fromHr: fromHr,
            toHr: toHr,
            timeinMinutes: timeinMinutes,
            workType: workType,
            remarks1: remarks1

        }];
       
        const payload = {
            timeSheetMastre: {
                code: Code,
                employeeName: EmployeeName,
                date: Date,
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
                    GetEmpDateList();
                    //addNewRow();
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
}
async function Delete(TimeSheetMaster_Code) {
    if (confirm(`Are you sure you want to delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/Delete?Code=${TimeSheetMaster_Code}`,
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
