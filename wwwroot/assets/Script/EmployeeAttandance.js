var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_selectedCodes = [];
let G_workingHours = [];
let G_EmployeeMasterList = [];
$(document).ready(async function () {
    DatePicker();
    GetEmployeeIdCard();
    $("#ERPHeading").text("Employee Attandance");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
    $('#ddlEmployeeCard').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtEmployeeName").focus();
        }
    });
    $('#txtEmployeeName').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtFromDate").focus();
        }
    });
    $('#txtFromDate').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtShow").focus();
        }
    });
    $('.select-checkbox-multi').click(function () {
        let inputWidth = $(this).outerWidth();
        $('#dropdownList').css({
            'position': 'absolute',
            'width': inputWidth + 'px',
        }).toggle();
    });
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-container').length) {
            $('#dropdownList').hide();
        }
    });
    $('#selectAll').on('change', function () {
        $('.option').prop('checked', this.checked);
        updateSelectedText();
        GetEmpCodes();
    });
    $(document).on('change', '.option', function () {
        if ($('.option:checked').length === $('.option').length) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
            
        }
        updateSelectedText();
        GetEmpCodes();
    });
  
   
});
async function GetEmployeeIdCard() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeIdCard`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let html = '';
                response.forEach(item => {
                    html += `<label>
                    <input type="checkbox" class="option" value="${item.Code}" data-name="${item.EmployeeCard}"> ${item.EmployeeCard}
                    </label><br>`;
                });
                $('#checkboxOptions').html(html);
                if (UserTypes === "A") {
                    $("#dropdownButton").prop('disabled', false);
                } else {
                    $("#dropdownButton").prop('disabled', true);
                    let filtered = response.filter(x => x.Code == UserMaster_Code);
                    $("#dropdownButton").val(filtered[0]["EmployeeCard"])
                    GetGenerateTaskTicketDateList();
                    $("#txtEmployeeName").val(UserName);
                }
            }
        },
    });
}


async function GetCardwiseEmployeeName(cardCodesArray) {
    const cardCodes = cardCodesArray.join(',');
    $.ajax({
        url: `${appBaseURL}/api/Master/GetCardwiseEmployeeName?CardCode=${cardCodes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtEmployeeName").val(response[0].EmployeeName);
            }
        },
        error: function () {
            alert('Error loading work types');
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
            //if (highlightedDates.includes(formatted)) {
            //    return {
            //        classes: 'highlighted-date',
            //        tooltip: 'Data exists'
            //    };
            //}
            return true;
        }
    }).on('changeDate', function (e) {
        const selectedDate = e.date;
        const now = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        if (selectedDate > now) {
            alert("Future date not allowed!");
            $('#txtFromDate').datepicker('update', defaultDate);
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
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${year}-${month}-${day}`;
}
$(document).on('change', '#checkboxOptions,#selectAll,#txtFromDate', function () {
    if ($('.option:checked').length === $('.option').length) {
        $('#selectAll').prop('checked', true);
        GetGenerateTaskTicketDateList();
    } else {
        $('#selectAll').prop('checked', false);
        $("#txtSummary").hide();
        $("#txtstatus").hide();
    }
    GetGenerateTaskTicketDateList();
});
function GetGenerateTaskTicketDateList() {
  
    let Date = convertDateFormat($("#txtFromDate").val());
    let codes = GetEmpCodes();
    let Employee_Codes = UserType=='A'?Array.isArray(codes) ? codes.join(',') : JSON.parse(codes.replace(/'/g, '"')).join(',') : UserMaster_Code;

        $.ajax({
            url: `${appBaseURL}/api/Master/GetEmployeeAttandance?EmployeeCode=${Employee_Codes}&Date=${Date}`,
            type: 'POST',
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response.length > 0) {
                    $("#txtSummary").show();
                    $("#txtstatus").show();
                    const StringFilterColumn = [];
                    const NumericFilterColumn = [];
                    const DateFilterColumn = [];
                    const Button = false;
                    const showButtons = [];
                    const StringdoubleFilterColumn = [];
                    const hiddenColumns = ["Code"];
                    const ColumnAlignment = {};
                    const statusOptions = [
                        'Present',
                        'Absent',
                      /*  'Weekly Off',*/
                        'Holiday',
                        /*'Sick Leave',*/
                        'Leave',
                        'Half Day'
                    ];
                    const updatedResponse = response.map((item, index) => {
                        const statusSelect = `
                <select id="ddlStatus_${item.Code}" class="ddlStatus box_border form-control form-control-sm" data-index="${index}" autocomplete="off">
                <option value="">-- Select --</option>
                ${statusOptions.map(opt =>
                            `<option value="${opt}" ${opt === item.Status ? 'selected' : ''}>${opt}</option>`
                        ).join('')}
                </select>`;

                        const workingHoursInput = `
                <input type="number" id="txtWorkingHours_${item.Code}"
                class="txtWorkingHours box_border form-control form-control-sm Number"
                data-index="${index}" 
                value="${item.WorkingHours ?? ''}" 
                min="0" max="24" step="0.5" 
                autocomplete="off" />
                `;

                const RemainingHoursInput = `
                <input type="number" id="txtRemainingHours_${item.Code}"
                class="txtRemainingHours box_border form-control form-control-sm"
                data-index="${index}" 
                value="${item.RemainingHours}" 
                min="0" max="24" step="0.5" 
                autocomplete="off" readonly/>
                `;
                        return {
                            ...item,
                            "Status": statusSelect,
                            "WorkingHours": workingHoursInput,
                            "RemainingHours": RemainingHoursInput
                        };
                    });
                    BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
                } else {
                    $("#txtSummary").hide();
                    $("#txtstatus").hide();
                    toastr.error("Record not found...!");
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });
    
}
function updateSelectedText() {
    let selectedNames = $('.option:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#dropdownButton').val(selectedNames);
}
function GetEmpCodes() {
     G_selectedCodes = [];
    $('.option:checked').each(function () {
        G_selectedCodes.push($(this).val());
    });
    if (G_selectedCodes.length > 0) {
        GetCardwiseEmployeeName(G_selectedCodes);
    }else {
        $("#txtEmployeeName").val("");
    }
    return G_selectedCodes;
}

$(document).on('change', '.ddlStatus,.txtWorkingHours', function () {
    var id = this.id;
    let parts = id.split("_");
    var EmployeeMaster_Code = parts[1];
    var status = $("#ddlStatus_" + EmployeeMaster_Code).val();
    G_workingHours = $("#txtWorkingHours_" + EmployeeMaster_Code).val();
    let RemainingHourss = $("#txtRemainingHours_" + EmployeeMaster_Code).val();
    const date = convertDateFormat($("#txtFromDate").val());
    SaveEmployeeStatus(EmployeeMaster_Code, date, status, G_workingHours,RemainingHourss);
});
function SaveEmployeeStatus(Employee_Codes, date, status, workingHours, RemainingHourss) {
        const payload = {
            EmployeeMaster_Code: Employee_Codes,
            Date: date,
            Status: status,
            WorkingHours: workingHours,
            RemainingHours: RemainingHourss,
            UserMaster_Code: UserMaster_Code
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveEmployeeAttandance`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status =='Y') {
                    toastr.success(response[0].Msg);
                    GetGenerateTaskTicketDateList();
                } else {
                    toastr.success(response[0].Msg);
                }
               
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                toastr.error("Failed to save status.");
            }
        });
}
function Reset() {
    $("#txtSummary").hide();
    $("#txtstatus").hide();
    $('#txtEmployeeName').val("");
    $('#txtddlStatus').val("");
    $('.ddlStatus').val("");
    $('#dropdownButton').val(null).trigger('change');
    DatePicker();
    G_selectedCodes = [];
    $(".option").prop("checked", false);
}
$(document).on('change', '#txtddlStatus', function () {
    const status = $(this).val();  
    const date = convertDateFormat($("#txtFromDate").val());
    SaveEmployeeStatuss(G_selectedCodes, status, date);
});
function SaveEmployeeStatuss(codes, status, date) {
    let empCode = Array.isArray(codes) ? codes.join(',') : JSON.parse(codes.replace(/'/g, '"')).join(',');
    $.ajax({
        url: `${appBaseURL}/api/Master/SaveEmployeeStatus?EmployeeCode=${empCode}&Date=${date}&Status=${status}&UserMaster_Code=${UserMaster_Code}`,
        type: 'POST',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response[0].Status === 'Y') {
                toastr.success(response[0].Msg);
                GetGenerateTaskTicketDateList();
            } else {
                toastr.error(response[0].Msg);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("Failed to save status.");
        }
    });
}
