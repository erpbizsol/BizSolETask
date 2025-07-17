var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
//let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    DatePicker();
    $("#ERPHeading").text("Dashboard");
    $("#txtFromDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtToDate").focus();
        }
    });
    $("#txtToDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtShow").focus();
        }
    });
});
$("#txtClientWise").click(async function () {
    await GetClientType();
});
$("#txtWorkTypeWise").click(async function () {
    await GetWorkType();
});
$("#txtEmployeeWise").click(async function () {
    await GetEmployeeType();
});

$("#Workinghour").click(async function () {
    LoadWorkingHours();
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
function convertToYearMonthDay(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
function GetClientType() {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetClientType?FromDate=${FromDate}&ToDate=${ToDate}`,
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
                const hiddenColumns = ["TimeInMinutes", "RatePerHr", "TimeInHours","Amount"];
                const ColumnAlignment = {};
                const updatedResponse = response.map(item => ({
                    ...item, 'Action':
                        `<button class="btn btn-success icon-height mb-1" style="background:#216c4a" title="A.D+" onclick="GetAssingData('${item.Code}')">
                    <i class="fa-solid fa-plus"></i>
                    </button>`
                    }));

                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerClient",
                    "table-bodyClient",
                    updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesClient").textContent = totalMinutes;
                $('#attachmentModal').show();
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
        url: `${appBaseURL}/api/Dashboard/GetWorkType?FromDate=${FromDate}&ToDate=${ToDate}`,
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
                const hiddenColumns = ["TimeInMinutes", "RatePerHr","Amount"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerWorkType",
                    "table-bodyWorkType",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesWorkType").textContent = totalMinutes;

                $("#attachmentWorkType").show();
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
        url: `${appBaseURL}/api/Dashboard/GetEmployeeType?FromDate=${FromDate}&ToDate=${ToDate}`,
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
                const hiddenColumns = ["TimeInMinutes", "RatePerHr","Amount"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerEmployeeType",
                    "table-bodyEmployeeType",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesEmployeeType").textContent = totalMinutes;
                $("#attachmentEmployeeType").show();
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
function LoadWorkingHours() {
    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEmployeeHours`,
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
                const hiddenColumns = [];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable(
                    "table-headerworking",
                    "table-bodyworking",
                    response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, true
                );
                const totalMinutes = response.reduce((sum, item) => sum + (parseInt(item["Time (in Hrs)"]) || 0), 0);
                document.getElementById("footerTotalMinutesClient").textContent = totalMinutes;
                $('#attachmentModal3').show();
            } else {
                $("#txtSummary").hide();
                toastr.error("Record not found...!");
            }
        }
    });
}
function Reset() {
    DatePicker();
}
function GetAssingData(Code) {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEmployeeWiseStatus?FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}`,
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
                BizsolCustomFilterGrid.CreateDataTable("table-headerworking", "table-bodyworking", response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
                $('#attachmentModal3').show();
            } else {
                toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}