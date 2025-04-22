var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    $("#ERPHeading").text("Employee Rate/Hour Details");
    ShowDetailList(0,'Load');
   
    GetEmployeeMasterList();
    $('#txtItemBarCode').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtOpeningBalance").focus();
        }
    });
    $('#txtOpeningBalance').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtbtnSave").focus();
        }
    });
});
function ShowDetailList(Code,Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeRatePerHourDetails?EmployeeMaster_Code=${Code}`,
        type: 'GET',
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
                const hiddenColumns = ["Code", "EmployeeMaster_Code", "TodayDate","IsPastDate"];
                const ColumnAlignment = {
                };
                const updatedResponse = response.map(item => {
                    const isFuture = item.IsPastDate === 'N';

                    return {
                        ...item,
                        "Effective Date": `<input type="text" oninput="GetValidDateFormet(this)" autocomplete="off" id="txtDate_${item.Code}" class="txtDate form-control form-control-sm box_border" value="${item['Effective Date']}" ${isFuture ? '' : 'disabled'} />`,
                        "Rate Per Hour": `<input type="text" onkeyup="OnlyNumeric(this)" autocomplete="off" id="txtRatePerHour_${item.Code}" class="txtRatePerHour Number form-control form-control-sm box_border" value="${item['Rate Per Hour']}" ${isFuture ? '' : 'disabled'} />`,
                        Action: isFuture
                            ? `<button class="btn btn-success icon-height mb-1" title="Edit" onclick="SaveData('${item.Code}')"><i class="fas fa-save"></i></button>
                            <button class="btn btn-danger icon-height mb-1" title="Delete" onclick="Delete('${item.Code}')"><i class="fa-solid fa-trash"></i></button>`
                            : ''
                    };
                });
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
                addNewRow();
            } else {
                addNewRow();
                if (Type == 'Get') {
                    toastr.error("Record not found...!");
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
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
async function Delete(Code) {
    if (confirm(`Are you sure you want to delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/DeleteEmployeeRatePerHourDetails?Code=${Code}`,
            type: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    ShowDetailList($("#ddlEmployeeName").val(), 'Get');
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
function addNewRow() {
    const table = document.getElementById("table");
    const tableHead = table.querySelector("thead");
    const tableBody = table.querySelector("tbody");

    if (!tableHead.querySelector("tr")) {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Effective Date</th>
            <th>Rate Per Hour</th>
            <th>Action</th>`;
        tableHead.appendChild(headerRow);
    }
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="text" id="txtDate_0" oninput="GetValidDateFormet(this)" autocomplete="off" class="txtDate form-control form-control-sm box_border"/></td>
        <td><input type="text" id="txtRatePerHour_0" onkeyup="OnlyNumeric(this)" autocomplete="off" class="txtRatePerHour Number form-control form-control-sm box_border"/></td>
        <td><button class="btn btn-success icon-height mb-1 Save" onclick="SaveData(0)" title="Save"><i class="fas fa-save"></i></button></td>`;

    tableBody.appendChild(newRow);
    DatePicker();
}
function ClearData() {
    $("#txtOpeningBalance").val("");
    $("#txtItemName").val("");
    $("#txtItemCode").val("");
    $("#txtItemBarCode").val("");
}
function GetEmployeeRateDetails(event) {
   var Code = $(event).val();
    ShowDetailList(Code, 'Get');
}
function validateFromDate(value, event) {
    let regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    let isValidFormat = regex.test(value);

    if (isValidFormat) {
        let parts = value.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);

        let date = new Date(year, month - 1, day);

        if (date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day) {

            $(event).val(value);
        } else {
            $(event).val('');

        }
    } else {
        $(event).val('');

    }
}
function DatePicker() {
    let date = new Date();
    let formattedDate = ('0' + date.getDate()).slice(-2) + '/' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
        date.getFullYear();

    $('#txtDate_0').val(formattedDate);

    $('.txtDate,#txtDate_0').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
    });
}
function OnlyNumeric(event) {
    if (/\D/g.test(event.value)) event.value = event.value.replace(/[^0-9]/g, '')
};
function GetValidDateFormet(event) {
        let value = $(event).val().replace(/[^\d]/g, '');

        if (value.length >= 2 && value.length < 4) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        } else if (value.length >= 4) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
        }
        $(event).val(value);

        if (value.length === 10) {
            validateFromDate(value,event);
        } else {
            $(event).val(value);
        }
}
function Save(EffectiveDate, RatePerHour, EmployeeMaster_Code, Code) {
    const payload = {
        Code: Code,
        EffectiveDate: EffectiveDate,
        RatePerHour: RatePerHour,
        EmployeeMaster_Code: EmployeeMaster_Code,
        UserMaster_Code: UserMaster_Code
    };
    $.ajax({
        url: `${appBaseURL}/api/Master/SaveEmployeeRatePerHourDetails`,
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
                ShowDetailList($("#ddlEmployeeName").val(), 'Get');
            } else if (response[0].Status === "N") {
                toastr.error(response[0].Msg);
            } else {
                toastr.error(response.Msg);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred while saving the data.");
        },
    });
}
function SaveData(Code) {
    var EffectiveDate = $("#txtDate_" + Code).val();
    var RatePerHour = $("#txtRatePerHour_" + Code).val();
    var EmployeeMaster_Code = $("#ddlEmployeeName").val();
    var Code = Code
    if (EmployeeMaster_Code == '0') {
        toastr.error('Please select employee name.!');
        $("#ddlEmployeeName").focus();
        return;
    } else if (EffectiveDate == '' || EffectiveDate == null) {
        toastr.error('Please select effective date.!');
        $("#txtDate_" + Code).focus();
        return;
    } else if (RatePerHour == '' || RatePerHour == '0') {
        toastr.error('Please enter rate per hour.!');
        $("#txtRatePerHour_" + Code).focus();
        return;
    } else {
        Save(convertDateFormat(EffectiveDate), RatePerHour, EmployeeMaster_Code, Code);
    }
}
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${day}-${monthAbbreviation}-${year}`;
}

$(document).on('keydown', '#table input', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        let currentInput = $(this);
        let currentRow = currentInput.closest('tr')[0];

        let lastRow = $('#table #table-body tr').last();
        
        let inputs = $('#table').find('input:not([disabled])');
        let currentIndex = inputs.index(currentInput);
        if (currentIndex + 1 < inputs.length) {
            inputs.eq(currentIndex + 1).focus();
        }
    }
});