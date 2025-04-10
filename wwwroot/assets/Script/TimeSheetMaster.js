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
                let option = '<option value="0">Select</option>';
                $.each(response, function (key, val) {

                    option += '<option value="' + val.Code + '">' + val["ClientName"] + '</option>';
                });

                $('#ddlDipartment')[0].innerHTML = option;

                $('#ddlDipartment').select2({
                    width: '-webkit-fill-available'
                });
            } else {
                $('#ddlDipartment').empty();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#ddlDipartment').empty();
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
                let option = '<option value="0">Select</option>';
                $.each(response, function (key, val) {

                    option += '<option value="' + val.Code + '">' + val["WorkType"] + '</option>';
                });

                $('#ddlWorkType')[0].innerHTML = option;

                $('#ddlWorkType').select2({
                    width: '-webkit-fill-available'
                });
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
    const table = document.getElementById("tblorderbooking").querySelector("tbody");
    const rows = table.querySelectorAll("tr");
    const rowCount = rows.length;

    if (rowCount > 0 && !isRowComplete(rows[rowCount - 1])) {
        alert("Please fill in all mandatory fields in the current row before adding a new one.");
        return;
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
        <select id="ddlDipartment" class="form-control form-control-sm box_border mandatory"></select></td>
        <td><input type="text" class="form-control form-control-sm box_border" placeholder="From Hr"></td>
        <td><input type="text" class="form-control form-control-sm box_border" placeholder="To Hr"></td>
        <td><input type="text" class="form-control form-control-sm box_border" placeholder="Time in Minutes"></td>
        <td> <select id="ddlWorkType" class="form-control form-control-sm box_border"></select></td>
        <td><input type="text" class="form-control form-control-sm box_border" placeholder="Remarks"></td>
        <td>
            <button class="btn btn-success btn-sm saveRow" title="Save">
                <i class="fa fa-save"></i>
            </button>
            <button class="btn btn-danger btn-sm deleteRow" title="Delete">
                <i class="fa fa-trash-alt"></i>
            </button>
        </td>
    `;
    table.appendChild(newRow);
}

$(document).on("click", ".deleteRow", function () {
    const row = $(this).closest("tr");
    const table = document.getElementById("tblorderbooking").querySelector("tbody");

    if (table.querySelectorAll("tr").length > 1) {
        row.remove();
    } else {
        alert("At least one row is required.");
    }
});