var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    $("#ERPHeading").text("Employee Rate/Hour Details");
    ShowDetailList(0);
   
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
function ShowDetailList(Code) {
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
                const hiddenColumns = ["Code","EmployeeMaster_Code"];
                const ColumnAlignment = {
                    "Opening Balance": "right"
                };
                const updatedResponse = response.map(item => ({
                    ...item,
                    EffectiveDate: `<input type="text" oninput="GetValidDateFormet(this)" id="txtDate_${item.Code}" class="txtDate form-control form-control-sm box_border" value="${item.EffectiveDate}" />`,
                    RatePerHour: `<input type="text" onkeyup="OnlyNumeric(this)" id="txtRatePerHour_${item.Code}" class="txtRatePerHour Number form-control form-control-sm box_border" value="${item.RatePerHour}" />`,
                    Action: `<button class="btn btn-danger icon-height mb-1" title="Delete" onclick="deleteItem('${item.Code}','${item[`Item Code`]}',this)"><i class="fa-regular fa-circle-xmark"></i></button>`
                }));
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment, false);
                addNewRow();
            } else {
                addNewRow();
                toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function GetEmployeeMasterList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeMasterList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let option = '<option value="0">Select</option>';
                $.each(response, function (key, val) {

                    option += '<option value="' + val.Code + '">' + val["Emp Name"] + '</option>';
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
            $('#txtWarehouse').empty();
        }
    });
}
async function deleteItem(Code, ItemCode, button) {
    let tr = button.closest("tr");
    tr.classList.add("highlight");
    const { hasPermission, msg } = await CheckOptionPermission('Delete', UserMaster_Code, UserModuleMaster_Code);
    if (hasPermission == false) {
        toastr.error(msg);
        $('tr').removeClass('highlight');
        return;
    }
    const { Status, msg1 } = await CheckRelatedRecord(Code, 'ItemOpeningBalance');
    if (Status == true) {
        toastr.error(msg1);
        $('tr').removeClass('highlight');
        return;
    }
    if (confirm(`Are you sure you want to delete this  ${ItemCode}.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/OrderMaster/DeleteOpeningBalance?Code=${Code}&UserMaster_Code=${UserMaster_Code}`,
            type: 'POST',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    ShowItemOpeningBalancelist();

                } else {
                    toastr.error("Unexpected response format.");
                }
            },
            error: function (xhr, status, error) {
                toastr.error("Error deleting item:", Msg);

            }
        });
    }
    else {
        $('tr').removeClass('highlight');
    }
    $('tr').removeClass('highlight');
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
        <td><input type="text" id="txtDate_0" oninput="GetValidDateFormet(this)" class="txtDate form-control form-control-sm box_border"/></td>
        <td><input type="text" id="txtRatePerHour_0" onkeyup="OnlyNumeric(this)" class="txtRatePerHour Number form-control form-control-sm box_border"/></td>
        <td><button class="btn btn-success icon-height mb-1 Save" title="Save"><i class="fas fa-save"></i></button></td>`;

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
    ShowDetailList(Code);
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