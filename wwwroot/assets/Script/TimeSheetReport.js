var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
let G_ReportType = "";
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    DatePicker();
   
    //GetWorkTypeList();
   // GetClientList();
    $("#ERPHeading").text("Time Sheet Report");
    $("#txtFromDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtToDate").focus();
        }
    });
    $("#txtToDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#ddlWorkType").focus();
        }
    });
    //$("#ddlEmployeeName").on('keydown', function (e) {
    //    alert(e.key)
    //    if (e.key === "Enter") {
    //        $("#ddlWorkType").focus();
    //    }
    //});
    $("#ddlWorkType").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#ddlClientName").focus();
        }
    });
    $("#ddlClientName").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#ddlReportType").focus();
        }
    });
    $("#ddlReportType").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtShow").focus();
        }
    });
   
    if (UserTypes === "A") {
        $("#ddlEmployeeName").prop('disabled', false);

    } else {
        $("#ddlEmployeeName").prop('disabled', true);
        SelectOptionByText('ddlEmployeeName', UserName);
    }
    $('.select-checkbox-multis').click(function () {
        let inputWidth = $(this).outerWidth();
        $('#ddlWorkType').css({
            'position': 'absolute',
            'width': inputWidth + 'px',
        }).toggle();
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-container').length) {
            $('#ddlWorkType').hide();
        }
    });

    $('#selectAll').on('change', function () {
        $('.option').prop('checked', this.checked);
        updateSelectedText();
    });
    $(document).on('change', '.option', function () {
        if ($('.option:checked').length === $('.option').length) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
        }
        updateSelectedText();
    });
    GetWorkTypeList();
    $('.select-checkbox-multi').click(function () {
        let inputWidth = $(this).outerWidth();
        $('#ddlClientName').css({
            'position': 'absolute',
            'width': inputWidth + 'px',
        }).toggle();
    });
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-container1').length) {
            $('#ddlClientName').hide();
        }
    });
    $('#selectAllClient').on('change', function () {
        $('.option1').prop('checked', this.checked);
        updateSelectedTextC();
    });
    $(document).on('change', '.option1', function () {
        if ($('.option1:checked').length === $('.option1').length) {
            $('#selectAllClient').prop('checked', true);
        } else {
            $('#selectAllClient').prop('checked', false);
        }
        updateSelectedTextC();
    });
    GetClientList();
    $('.select-checkbox-multi2').click(function () {
        let inputWidth = $(this).outerWidth();
        $('#ddlEmployeeName').css({
            'position': 'absolute',
            'width': inputWidth + 'px',
        }).toggle();
    });
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-container2').length) {
            $('#ddlEmployeeName').hide();
        }
    });
    $('#selectAllEmployee').on('change', function () {
        $('.option2').prop('checked', this.checked);
        updateSelectedTextEmployee();
    });
    $(document).on('change', '.option2', function () {
        if ($('.option2:checked').length === $('.option2').length) {
            $('#selectAllEmployee').prop('checked', true);
        } else {
            $('#selectAllEmployee').prop('checked', false);
        }
        updateSelectedTextEmployee();
    });
    GetEmployeeMasterList();
});
function updateSelectedText() {
    let selectedNames = $('.option:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#SddlWorkType').val(selectedNames);
}
function updateSelectedTextC() {
    let selectedNamess = $('.option1:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#CddlClientName').val(selectedNamess);
}

function GetSelectedWorkTypeCodes() {
    let selectedCodes = [];
    $('.option:checked').each(function () {
        selectedCodes.push($(this).val());
    });
    return selectedCodes;
}
function GetSelectedClientCodes() {
    let selectedCodes = [];
    $('.option1:checked').each(function () {
        selectedCodes.push($(this).val());
    });
    return selectedCodes;
}
$("#txtShow").click(async function () {
    var reportType = $("#ddlReportType").val();

    if (reportType === "Default") {
        await GetTimeSheetReport();
        await GetClientType();
        await GetWorkType();
        await GetEmployeeType();
        $("#txtSummary").show();
    } else {
        await GetTimeSheetReport();
        $("#txtSummary").hide();
    }

});
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);
    $('#txtToDate').val(defaultDate);
    $('#txtToDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('update', defaultDate);
    setStartOfMonth();
}
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function setStartOfMonth() {

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatted = formatDateToString(firstDay);

    $('#txtFromDate').val(formatted);
    $('#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('update', formatted);

}
function setupDateInputFormatting() {
    $('#txtFromDate,#txtToDate').on('input', function () {
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
            $('#txtFromDate,#txtToDate').val('');
        }
    } else {
        $('#txtFromDate,#txtToDate').val('');
    }
}
function updateSelectedTextEmployee() {
    let selectedNamess = $('.option2:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#SddlEmployeeName').val(selectedNamess);
}
function GetSelectedEmployeeCodes() {
    let selectedCodes = [];
    $('.option3:checked').each(function () {
        selectedCodes.push($(this).val());
    });
    return selectedCodes;
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
                //const $select = $('#ddlEmployeeName');
                //$select.empty();

                //$.each(response, function (key, val) {
                //    $select.append(new Option(val.EmployeeName, val.Code));
                //});
                //SelectOptionByText('ddlEmployeeName', UserName);
                //$select.select2({
                //    width: '100%',
                //    closeOnSelect: false,
                //    placeholder: "Select Employee...",
                //    allowClear: true

                //});
                let html1 = '';
                response.forEach(item => {
                    html1 += `<label>
                    <input type="checkbox" class="option2" value="${item.Code}" data-name="${item.EmployeeName.trim()}"> ${item.EmployeeName.trim()}
                    </label><br>`;
                });
                $('#checkboxOptions2').html(html1);
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
                if (response.length > 0) {
                    let html = '';
                    response.forEach(item => {
                        html += `<label>
                    <input type="checkbox" class="option" value="${item.Code}" data-name="${item.WorkType.trim()}"> ${item.WorkType.trim()}
                    </label><br>`;
                    });
                    $('#checkboxOptions').html(html);
                }
                //const $select = $('#ddlWorkType');
                //$select.empty();

                //$.each(response, function (key, val) {
                //    $select.append(new Option(val.WorkType, val.Code));
                //});

                //$select.select2({
                //    width: '100%',
                //    closeOnSelect: false,
                //    placeholder: "Select Work Type...",
                //    allowClear: true
                //});
            } else {
                $('#ddlWorkType').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#ddlWorkType').empty();
        }
    });
}
function GetClientList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetClientNameList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                //const $select = $('#ddlClientName');
                //$select.empty();

                //$.each(response, function (key, val) {
                //    $select.append(new Option(val.ClientName, val.Code));
                //});

                //$select.select2({
                //    width: '100%',
                //    closeOnSelect: false,
                //    placeholder: "Select Client...",
                //    allowClear: true
                //});
                let html1 = '';
                response.forEach(item => {
                    html1 += `<label>
                    <input type="checkbox" class="option1" value="${item.Code}" data-name="${item.ClientName.trim()}"> ${item.ClientName.trim()}
                    </label><br>`;
                });
                $('#ClientOptions').html(html1);
            } else {
                $('#ddlClientName').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#ddlClientName').empty();
        }
    });
}
function convertToYearMonthDay(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
function GetTimeSheetReport() {
    const emp = document.getElementById('SddlEmployeeName').value;
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    //const WorkType = $('#ddlWorkType').val();
    const WorkType = document.getElementById('SddlWorkType').value;
    //const ClientName = $('#ddlClientName').val();
    const ClientName = document.getElementById('CddlClientName').value;
    const ReportType = $('#ddlReportType').val();
    G_ReportType = ReportType;
    let W_Code = GetSelectedWorkTypeCodes();
    let C_Code = GetSelectedClientCodes();
    let E_Code = GetSelectedEmployeeCodes();
    let WorkType_Codes = Array.isArray(W_Code) ? W_Code.join(',') : JSON.parse(W_Code.replace(/'/g, '"')).join(',');
    let ClientName_Codes = Array.isArray(C_Code) ? C_Code.join(',') : JSON.parse(C_Code.replace(/'/g, '"')).join(',');
    let EmployeeName_Codes = Array.isArray(E_Code) ? E_Code.join(',') : JSON.parse(E_Code.replace(/'/g, '"')).join(',');
    $.ajax({
        url: `${appBaseURL}/api/Report/GetTimeSheetReport?FromDate=${FromDate}&ToDate=${ToDate}&ClientMaster_Code=${ClientName_Codes}&WorkTypeMaster_Code=${WorkType_Codes}&EmployeeMaster_Code=${EmployeeName_Codes}&ReportType=${ReportType}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            $("#table-header").empty();
            $("#table-body").empty();
            $("#footerTotalMinutes").empty();
            if (response.length > 0) {
                $("#AllTable").show();
                const StringFilterColumn = ["Client"];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = [];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true);
                var dynamicColspan;
                if (ReportType == 'Default') {
                    var dynamicColspan = 2;
                    document.getElementById('myCell1').setAttribute('style', 'display:none');
                    const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time In Minutes"]) || 0), 0);
                    document.getElementById("footerTotalMinutes").textContent = totalMinutes;
                } else {
                    var dynamicColspan = 2;
                    document.getElementById('myCell1').setAttribute('style', 'display:none');
                    const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                    document.getElementById("footerTotalMinutes").textContent = totalMinutes;
                }
                document.getElementById('myCell').setAttribute('colspan', dynamicColspan);
            } else {
                toastr.error("Record not Found !..");
                $("#AllTable").hide();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function GetClientType() {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    $.ajax({
        url: `${appBaseURL}/api/Report/GetClientType?FromDate=${FromDate}&ToDate=${ToDate}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtSummary").show();
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["TimeInMinutes", "RatePerHr", "TimeInHours"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerClient",
                    "table-bodyClient",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesClient").textContent = totalMinutes;

            } else {
                $("#txtSummary").hide();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyClient').empty();
        }
    });
}
function GetWorkType() {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    $.ajax({
        url: `${appBaseURL}/api/Report/GetWorkType?FromDate=${FromDate}&ToDate=${ToDate}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtSummary").show();
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["TimeInMinutes", "RatePerHr"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerWorkType",
                    "table-bodyWorkType",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesWorkType").textContent = totalMinutes;

            } else {
                $("#txtSummary").hide();

            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyWorkType').empty();
        }
    });
}
function GetEmployeeType() {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    $.ajax({
        url: `${appBaseURL}/api/Report/GetEmployeeType?FromDate=${FromDate}&ToDate=${ToDate}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtSummary").show();
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["TimeInMinutes", "RatePerHr"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerEmployeeType",
                    "table-bodyEmployeeType",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesEmployeeType").textContent = totalMinutes;

            } else {
                $("#txtSummary").hide();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyEmployeeType').empty();
        }
    });
}
function Reset() {
    $('#SddlWorkType').val("").trigger('change');
    $('#SddlEmployeeName').val("").trigger('change');
    $('#CddlClientName').val("").trigger('change');
    $("#AllTable").hide();
    $("#txtSummary").hide();
    document.getElementById("footerTotalMinutes").textContent = '';
    document.getElementById("footerTotalMinutesClient").textContent = '';
    document.getElementById("footerTotalMinutesWorkType").textContent = '';
    document.getElementById("footerTotalMinutesEmployeeType").textContent = '';
    DatePicker();
}
function DataExport() {
    const emp = $('#ddlEmployeeName').val();
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    const WorkType = $('#ddlWorkType').val();
    const ClientName = $('#ddlClientName').val();
    const ReportType = $('#ddlReportType').val();
    $.ajax({
        url: `${appBaseURL}/api/Report/GetTimeSheetReport?FromDate=${FromDate}&ToDate=${ToDate}&ClientMaster_Code=${ClientName}&WorkTypeMaster_Code=${WorkType}&EmployeeMaster_Code=${emp}&ReportType=${ReportType}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                Export(response);
            } else {
                toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}
function Export(jsonData) {
    const columnsToRemove = [""];

    const filteredData = jsonData.map(row =>
        Object.fromEntries(Object.entries(row).filter(([key]) => !columnsToRemove.includes(key)))
    );

    let totalRow = {};
    let numericKeys = [];

    if (G_ReportType === "Default") {
        numericKeys = ["Time In Minutes"];

    } else {
        numericKeys = ["Time (in Hrs)"];
    }

    const allKeys = Object.keys(filteredData[0]);

    for (let key of allKeys) {
        if (key === allKeys[0]) {
            totalRow[key] = "Total:";
        } else if (numericKeys.includes(key)) {
            totalRow[key] = filteredData.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
        } else {
            totalRow[key] = "";
        }
    }

    filteredData.push(totalRow);

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "TimeSheetReport.xlsx");
}


