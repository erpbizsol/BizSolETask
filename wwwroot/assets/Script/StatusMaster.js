
var authKeyData = sessionStorage.getItem('authKey');
var jsonObject = JSON.parse(authKeyData);
let UserMaster_Code = jsonObject.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_JsonData = [];

$(document).ready(function () {
    ShowStatusMaster('Load');
    $("#ERPHeading").text("Status Master");
    $('#txtStatusName').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtStatusDescription").focus();
        }
    });
    $('#txtStatusDescription').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnSave").focus();
        }
    });
    $("#btnSave").click(function () {
        Save();
    });
    $("#txtExcelFile").change(function (e) {
        Import(e);
    });
    $("#btnUpload").click(function (e) {
        UploadExcel();
    });
});
function ShowStatusMaster(Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatusMasterList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtStatusTable").show();
                const StringFilterColumn = ["Status Description"];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code"];
                const ColumnAlignment = {
                };
                const updatedResponse = response.map(item => ({
                    ...item, 'Action': `
                    <button class="btn btn-danger icon-height mb-1"  title="Delete" onclick="Delete('${item.Code}')"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn btn-primary icon-height mb-1 btn1"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                }));
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);

            } else {
                $("#txtStatusTable").hide();
                if (Type != 'Load') {
                    //toastr.error("Record not found...!");
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}
function Save() {
    var StatusName = $("#txtStatusName").val();
    var StatusDescription = $("#txtStatusDescription").val();
    var Code = $("#hfCode").val();
    if (StatusName == "") {
        toastr.error('Please enter Status Name.');
        $("#txtStatusName").focus();
        return;
    } else if (StatusDescription == "") {
        toastr.error('Please enter Status Description.');
        $("#txtStatusDescription").focus();
        return;
    } 
    else {
        const payload = {
            Code: Code,
            StatusName: StatusName,
            StatusDescription: StatusDescription,
            UserMaster_Code: UserMaster_Code
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveStatusMaster`,
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
                    ShowStatusMaster('Get');
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
    $("#txtListpage").hide();
    $("#txtCreatepage").show();
}
function Back() {
    $("#txtListpage").show();
    $("#txtCreatepage").hide();
    ClearData();
}
function Edit(code) {
    $("#txtListpage").hide();
    $("#txtCreatepage").show();
    $.ajax({
        url: ` ${appBaseURL}/api/Master/GetStatusMasterByCode?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {
                $("#hfCode").val(response[0].Code);
                $("#txtStatusName").val(response[0].StatusName);
                $("#txtStatusDescription").val(response[0].StatusDescription);
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
function ClearData() {
    $("#hfCode").val("0");
    $("#txtStatusName").val("");
    $("#txtStatusDescription").val("");
}
function Delete(code) {
    if (confirm(`Are you sure you want delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/DeleteStatusMaster?Code=${code}`,
            type: 'Get',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    Back();
                    ShowStatusMaster('Get');
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



function GetExcelTemplate(WithData) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetExcelTemplate?Mode=StatusMaster&WithData=${WithData}'`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                ExportToExcel(response);
            } else {
                toastr.error("Record not found...!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}
function ExportToExcel(data) {
    let ws = XLSX.utils.json_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, "StatusMaster.xlsx");
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
        url: `${appBaseURL}/api/Master/ImportStatusMaster?UserMaster_Code=${UserMaster_Code}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(requestData),
        success: function (response) {
            if (response[0].Status === 'Y') {
                toastr.success(response[0].Msg);
                $("#txtExcelFile").val("");
                G_JsonData = [];
                ShowStatusMaster("Get");
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
    const requiredColumns = ['Status', 'StatusCard', 'StatusName', 'Password', 'Email', 'MobileNo', 'StatusType'];

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
