
var authKeyData = sessionStorage.getItem('authKey');
var jsonObject = JSON.parse(authKeyData);
let UserMaster_Code = jsonObject.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_JsonData = [];
let G_Edit =false;
$(document).ready(function () {
    $("#ERPHeading").text("Employee Master");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
    $('#txtEmployeeId').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtEmployeeName").focus();
        }
    });
    $('#txtEmployeeName').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtEmailId").focus();
        }
    });
    $('#txtEmailId').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtMobileNo").focus();
        }
    });
    $('#txtMobileNo').on('keydown', function (e) {
        if (e.key === "Enter") {
            if (G_Edit == false) {
                $("#txtPassword").focus();
            } else {
                $('#txtEmployeeType').focus();
            }
        }
    });
    $('#txtPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtConfirmPassword").focus();
        }
    });
    $('#txtConfirmPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtEmployeeType").focus();
        }
    });
    $('#txtEmployeeType').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnSave").focus();
        }
    });
    $("#btnSave").click(function () {
        Save();
    });
    $("#btnPass").click(function () {
        EmployeeChangePassword();
    });
    ShowEmployeeMaster('Load');
    $("#txtExcelFile").change(function (e) {
        Import(e);
    });
    $("#btnUpload").click(function (e) {
        UploadExcel();
    });
});
function ShowEmployeeMaster(Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetEmployeeMasterList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtEmployeeTable").show();
                const StringFilterColumn = ["Emp Card", "Emp Name", "Email", "MobileNo","Emp Type"];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code", "Color","Change Password"];
                const ColumnAlignment = {
                    "CreatedOn": 'center'
                };
                const updatedResponse = response.map(item => ({
                    ...item, 'Action': `<button class="btn btn-primary icon-height mb-1 btn-width-100px"  title="Change Password" onclick="ChangePassword('${item.Code}')">Change Password</button>
                    <button class="${item.Color} icon-height mb-1"  title="Active/DeActive" onclick="ChangeStaus('${item.Code}')">${item.Action}</i></button>
                    <button class="btn btn-primary icon-height mb-1"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                    //'Edit': `<button class="btn btn-primary icon-height mb-1"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`,
                    //'Action': `<button class="${item.Color} icon-height mb-1"  title="Edit" onclick="Edit('${item.Code}')">${item.Action}</i></button>`
                }));
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);

            } else {
                $("#txtEmployeeTable").hide();
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
function Save() {
    var EmployeeName = $("#txtEmployeeName").val();
    var EmployeeCard = $("#txtEmployeeId").val();
    var EmployeeType = $("#txtEmployeeType").val();
    var Email = $("#txtEmailId").val();
    var MobileNo = $("#txtMobileNo").val();
    var Password = $("#txtPassword").val();
    var ConfirmPassword = $("#txtConfirmPassword").val();
    var Numberofdays = $("#txtnumberofdays").val();
    var WorkingHours = $("#txtWorkingHours").val();
    var Code = $("#hftxtCode").val();
    if (EmployeeCard == "") {
        toastr.error('Please enter Employee Card.');
        $("#txtEmployeeCard").focus();
        return;
    } else if (EmployeeName == "") {
        toastr.error('Please enter Employee Name.');
        $("#txtEmployeeName").focus();
        return;
    } else if (Email == "") {
        toastr.error('Please enter Email Id.');
        $("#txtEmailId").focus();
        return;
    } else if (!isEmail(Email)) {
        toastr.error('Please enter valid Email !.');
        $("#txtEmailId").focus();
        return;
    } else if (MobileNo == "") {
        toastr.error('Please enter Mobile No.');
        $("#txtMobileNo").focus();
        return;
    } else if (!IsMobileNumber(MobileNo)) {
        toastr.error('Please enter valid Mobile No.');
        $("#txtMobileNo").focus();
        return; 
    } else if (Password == "" && Code == 0) {
        toastr.error('Please enter Password.');
        $("#txtPassword").focus();
        return;
    } else if (ConfirmPassword == "" && Code == 0) {
        toastr.error('Please enter Confirm Password.');
        $("#txtConfirmPassword").focus();
        return;
    } else if (ConfirmPassword !== Password && Code == 0) {
        toastr.error('Your password and confirmation password do not match.');
        $("#txtPassword").focus();
        return;
    } else if (Numberofdays == 0) {
        toastr.error('Please enter valid Number of days.');
        $("#txtnumberofdays").focus();
        return;
    }
    else if (WorkingHours == 0) {
        toastr.error('Please enter valid Working Hours.');
        $("#txtWorkingHours").focus();
        return;
    }
    else {
        const payload = {
            Code: Code,
            EmployeeCard: EmployeeCard,
            EmployeeName: EmployeeName,
            Email: Email,
            MobileNo: MobileNo,
            Password: Password,
            EmployeeType: EmployeeType,
            EmployeeId: UserMaster_Code,
            Numberofdays: Numberofdays,
            WorkingHours: WorkingHours
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveEmployeeMaster`,
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
                        ShowEmployeeMaster('Get');
                        Back();
                }else if (response[0].Status === "N") {
                    toastr.error(response[0].Msg);
                }else {
                    toastr.error(response.Msg);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
            },
        });
    }
}
function EmployeeChangePassword() {
    var Password = $("#txtPassword").val();
    var ConfirmPassword = $("#txtConfirmPassword").val();
    var Code = $("#hftxtCode").val();
    if (Password == "") {
        toastr.error('Please enter Password.');
        $("#txtPassword").focus();
        return;
    } else if (ConfirmPassword == "") {
        toastr.error('Please enter Confirm Password.');
        $("#txtConfirmPassword").focus();
        return;
    } else if (ConfirmPassword !== Password) {
        toastr.error('Your password and confirmation password do not match.');
        $("#txtPassword").focus();
        return;
    }
    else {
        const payload = {
            Code: Code,
            EmployeeCard: 0,
            EmployeeName: "",
            Email: "",
            MobileNo: "",
            Password: Password,
            EmployeeType: "",
            EmployeeId: ""
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/ChangePassword`,
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
                    ShowEmployeeMaster('Get');
                    Back();
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
}
function Create() {
    ClearData();
    $("#tab1").text("NEW");
    $("#txtListpage").hide();
    $("#txtCreatepage").show();
    $("#txtheaderdiv").show();
    $("#dvEmployeeId").show();
    $("#dvEmployeeName").show();
    $("#dvEmployeeType").show();
    $("#dvEmailId").show();
    $("#dvMobileNo").show();
    $("#dvPassword").show();
    $("#dvConfirmPassword").show();
    $("#txtnumberofdays").show();
    $("#dvExcel").show();
    $("#txtWorkingHours").show();
}
function Back() {
    $("#txtListpage").show();
    $("#txtCreatepage").hide();
    $("#txtheaderdiv").hide();
    $("#btnSave").show();
    $("#btnPass").hide();
    ClearData();
}
function Edit(code) {
    G_Edit = true;
    $("#tab1").text("EDIT");
    $("#txtListpage").hide();
    $("#txtCreatepage").show();
    $("#txtheaderdiv").show();
    $("#dvEmployeeId").hide();
    $("#dvEmployeeName").show();
    $("#dvEmployeeType").show();
    $("#dvEmailId").show();
    $("#dvMobileNo").show();
    $("#dvPassword").hide();
    $("#dvConfirmPassword").hide();
    $("#dvExcel").hide();
    $("#txtnumberofdays").show();
    $("#txtWorkingHours").show();
    $.ajax({
        url: ` ${appBaseURL}/api/Master/GetEmployeeMasterByCode?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {  
                $("#hftxtCode").val(response[0].Code);
                $("#txtEmployeeId").val(response[0].EmployeeCard);
                $("#txtEmployeeName").val(response[0].EmployeeName);
                $("#txtEmailId").val(response[0].Email);
                $("#txtMobileNo").val(response[0].MobileNo);
                $("#txtEmployeeType").val(response[0].EmployeeType);
                $("#txtnumberofdays").val(response[0].NumberOfdays);
                $("#txtWorkingHours").val(response[0].WorkingHours);
            } else {
                toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("Failed to fetch data. Please try again.");
        }
    });
}
function ChangePassword(code) {
    $("#hftxtCode").val(code)
    $("#txtListpage").hide();
    $("#txtCreatepage").show();
    $("#txtheaderdiv").show();
    $("#dvEmployeeId").hide();
    $("#dvEmployeeName").hide();
    $("#dvEmployeeType").hide();
    $("#dvEmailId").hide();
    $("#dvMobileNo").hide();
    $("#dvPassword").show();
    $("#dvConfirmPassword").show();
    $("#dvExcel").hide();
    $("#btnSave").hide();
    $("#btnPass").show();
    $("#divnumber").hide();
    $("#divWorkingHours").hide();
}
function ClearData() {
    $("#hftxtCode").val("0");
    $("#txtEmployeeId").val("");
    $("#txtEmployeeName").val("");
    $("#txtEmailId").val("");
    $("#txtMobileNo").val("");
    $("#txtPassword").val("");
    $("#txtConfirmPassword").val("");
    $("#txtEmployeeType").val("A");
    $("#txtExcelFile").val("");
    $("#txtnumberofdays").val("");
    $("#txtWorkingHours").val("");
    G_Edit = false;
}
function ActionStatus(code) {
    swal({
        text: `Are you sure you want to delete Employee ${Employee}?`,
        icon: "warning",
        buttons: {
            cancel: {
                text: "Cancel",
                value: false,
                visible: true,
                closeModal: true,
                className: "swal-button-danger"
            },
            confirm: {
                text: "OK",
                value: true,
                visible: true,
                closeModal: true,
                className: "swal-button-success"
            }
        },
        dangerMode: true
    }).then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: `${appBaseURL}/api/Master/DeleteEmployeeMaster?Code=${code}&UserMaster_Code=${UserMaster_Code}`,
                type: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Auth-Key', authKeyData);
                },
                success: function (response) {
                    if (response.Status === 'Y') {
                        toastr.success(response.Msg);
                        ShowEmployeeMaster('Get');
                    } else {
                        toastr.error("Unexpected response format.");
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("Error deleting item:");
                }
            });
            return;
          
        } else {
            swal("Deletion Cancelled!");
            $('tr').removeClass('highlight');
        }
    });
}
function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}
function IsMobileNumber(txtMobId) {
    var mob = /^[6-9]{1}[0-9]{9}$/;
    if (mob.test(txtMobId) == false) {
        return false;
    }
    return true;
}
function ChangeStaus(code) {
    if (confirm(`Are you sure you want change status !`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/ChangeEmployeeStatus?Code=${code}`,
            type: 'Get',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    ShowEmployeeMaster('Get');
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
function GetExcelTemplate(WithData){
    $.ajax({
        url: `${appBaseURL}/api/Master/GetExcelTemplate?Mode=EmployeeMaster&WithData=${WithData}'`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                if (WithData == 'N') {
                    ExportToExcel(response, 'EmployeeMaster_Tamplate.xlsx');
                } else {
                    ExportToExcel(response, 'EmployeeMaster_Tamplate_Sample.xlsx');
                }
            } else {
                    toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}
function ExportToExcel(data,Name) {
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, Name);
}
function Import(event) {
    const file = event.target.files[0];

    if (!file) {
        alert("Please select an Excel file.");
        return;
    }

    const allowedExtensions = ['xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        alert("Invalid file type. Please upload an Excel file (.xlsx or .xls).");
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            if (workbook.SheetNames.length === 0) {
                alert("Invalid Excel file: No sheets found.");
                event.target.value = '';
                return;
            }

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const validationResult = validateExcelFormat(jsonData);
            if (!validationResult.isValid) {
                alert(`Invalid Excel format: ${validationResult.message}`);
                event.target.value = '';
                return;
            }

            const formattedData = convertToKeyValuePairs(jsonData);
            G_JsonData = formattedData;
            console.log(G_JsonData);
        } catch (error) {
            alert("Error reading the Excel file. Ensure it is a valid Excel format.");
            console.error(error);
            event.target.value = '';
        }
    };

    reader.readAsArrayBuffer(file);
}
function convertToKeyValuePairs(data) {
    if (data.length < 2) return [];
    const headers = data[0].map(header => header.replace(/[\s.]+/g, ''));
    const rows = data.slice(1);
    const mappedData = rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            let value = row[index] !== undefined ? row[index] : null;
            if (header.toLowerCase().includes('date') && value) {
                value = convertDateFormat1(value);
            }

            obj[header] = value;
        });
        return obj;
    });
    const uniqueData = [];
    const seenRows = new Set();

    mappedData.forEach(row => {
        const uniqueKey = headers.map(header => row[header]).join('|');

        if (!seenRows.has(uniqueKey)) {
            seenRows.add(uniqueKey);
            uniqueData.push(row);
        }
    });

    uniqueData.sort((a, b) => {
        const invoiceA = a["MobileNo"];
        const invoiceB = b["MobileNo"];
        if (typeof invoiceA === "string" && typeof invoiceB === "string") {
            return invoiceA.localeCompare(invoiceB, undefined, { numeric: true });
        }

        return invoiceA - invoiceB;
    });

    return uniqueData;
}
function UploadExcel() {
    if (G_JsonData.length == 0) {
        toastr.error("Please select xlx file !");
        $("#txtExcelFile").focus();
        return;
    };
    const requestData = G_JsonData;
    $.ajax({
        url: `${appBaseURL}/api/Master/ImportEmployeeMaster?UserMaster_Code=${UserMaster_Code}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(requestData),
        success: function (response) {
            if (response[0].Status === 'Y') {
                toastr.success(response[0].Msg);
                $("#txtExcelFile").val("");
                G_JsonData = [];
                ShowEmployeeMaster("Get");
                Back();
            } else {
                toastr.error("Record not found...!");
                $("#txtExcelFile").val("");
                G_JsonData = [];
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("Failed to fetch data. Please try again.");
        }
    });
}
function validateExcelFormat(data) {
    if (data.length < 2) {
        return { isValid: false, message: "The Excel file is empty or missing data rows." };
    }

    const headers = data[0].map(header => header.replace(/[\s.]+/g, ''));
    const requiredColumns = ['Status', 'EmployeeCard', 'EmployeeName', 'Password', 'Email', 'MobileNo', 'EmployeeType'];

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        return { isValid: false, message: `Missing required columns: ${missingColumns.join(', ')}` };
    }

    const emailIndex = headers.indexOf("Email");
    const mobileIndex = headers.indexOf("MobileNo");
    const requiredIndexes = requiredColumns.map(col => headers.indexOf(col));

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    const errors = [];
    for (let i = 1; i < data.length; i++) {
        requiredIndexes.forEach((index, colIndex) => {
            if (index !== -1) {
                const cellValue = data[i][index];
                if (cellValue === undefined || cellValue === null || cellValue.toString().trim() === '') {
                    errors.push(`Row ${i + 1}: ${requiredColumns[colIndex]} is required.`);
                }
            }
        });
        if (emailIndex !== -1) {
            const emailValue = data[i][emailIndex];
            if (emailValue && !emailRegex.test(emailValue.trim())) {
                errors.push(`Row ${i + 1}: Invalid Email format (${emailValue}).`);
            }
        }
        if (mobileIndex !== -1) {
            const mobileValue = data[i][mobileIndex];
            if (mobileValue && !mobileRegex.test(mobileValue.toString().trim())) {
                errors.push(`Row ${i + 1}: Invalid Mobile Number (${mobileValue}).`);
            }
        }
    }
    if (errors.length > 0) {
        return { isValid: false, message: `Validation errors:\n${errors.join('\n')}` };
    }
    return { isValid: true, message: "Excel format is valid." };
}
