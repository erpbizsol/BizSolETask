
var authKeyData = sessionStorage.getItem('authKey');
var jsonObject = JSON.parse(authKeyData);
let UserMaster_Code = jsonObject.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_JsonData = [];

$(document).ready(function () {
    ShowWorkTypeMaster('Load');
    $("#ERPHeading").text("Work Type Master");
    $('#txtWorkType').on('keydown', function (e) {
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
function ShowWorkTypeMaster(Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypeMasterList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtWorkTypeTable").show();
                const StringFilterColumn = ["Work Type"];
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
                    <button class="btn btn-primary icon-height mb-1"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                }));
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);

            } else {
                $("#txtWorkTypeTable").hide();
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
    var WorkType = $("#txtWorkType").val();
    var Code = $("#hfCode").val();
    if (WorkType == "") {
        toastr.error('Please enter Work Type.');
        $("#txtWorkType").focus();
        return;
    } 
    else {
        const payload = {
            Code: Code,
            WorkType: WorkType,
            UserMaster_Code: UserMaster_Code
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveWorkTypeMaster`,
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
                    ShowWorkTypeMaster('Get');
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
        url: ` ${appBaseURL}/api/Master/GetWorkTypeMasterByCode?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {
                $("#hfCode").val(response[0].Code);
                $("#txtWorkType").val(response[0].WorkType);
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
    $("#txtWorkType").val("");
}
function Delete(code) {
    if (confirm(`Are you sure you want delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/DeleteWorkTypeMaster?Code=${code}`,
            type: 'Get',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    ShowWorkTypeMaster('Get');
                }else {
                    toastr.error(response[0].Msg);
                }
            },
            error: function (xhr, status, error) {
                toastr.error("Cannot be deleted as it is referenced.");
            }
        });
    }
}
function GetExcelTemplate(WithData) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetExcelTemplate?Mode=WorkTypeMaster&WithData=${WithData}'`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                if (WithData == 'N') {
                    ExportToExcel(response, 'WorkType_Tamplate.xlsx');
                } else {
                    ExportToExcel(response, 'WorkType_Tamplate_Sample.xlsx');
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
        url: `${appBaseURL}/api/Master/ImportWorkTypeMaster?UserMaster_Code=${UserMaster_Code}`,
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(requestData),
        success: function (response) {
            if (response[0].Status === 'Y') {
                toastr.success(response[0].Msg);
                $("#txtExcelFile").val("");
                G_JsonData = [];
                ShowWorkTypeMaster("Get");
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
    const requiredColumns = ['WorkType'];

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        return { isValid: false, message: `Missing required columns: ${missingColumns.join(', ')}` };
    }

    const requiredIndexes = requiredColumns.map(col => headers.indexOf(col));
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
        
    }
    if (errors.length > 0) {
        return { isValid: false, message: `Validation errors:\n${errors.join('\n')}` };
    }
    return { isValid: true, message: "Excel format is valid." };
}