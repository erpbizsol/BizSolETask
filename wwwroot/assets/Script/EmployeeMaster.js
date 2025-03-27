
var authKeyData = sessionStorage.getItem('authKey');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserModuleMaster_Code = 0;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    $("#ERPHeading").text("Employee Master");
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
            $("#txtPassword").focus();
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
                    "CreatedOn": 'center',
                    "Digit After Decimal": 'right',
                };
                const updatedResponse = response.map(item => ({
                    ...item, 'Action': `<button class="btn btn-primary icon-height mb-1"  title="Change Password" onclick="ChangePassword('${item.Code}')">Change Password</button>
                    <button class="${item.Color} icon-height mb-1"  title="Active/DeActive" onclick="Edit('${item.Code}')">${item.Action}</i></button>
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
            EmployeeId: UserMaster_Code
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
    $("#dvExcel").show();
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
}
function GetModuleMasterCode() {
    var Data = JSON.parse(sessionStorage.getItem('UserModuleMaster'));
    const result = Data.find(item => item.ModuleDesp === "Employee Master");
    if (result) {
        UserModuleMaster_Code = result.Code;
    }
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




