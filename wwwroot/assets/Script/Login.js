let AppBaseURLMenu = window.location.href.toLowerCase().includes('local') == true ? 'https://localhost:7077' : 'https://web.bizsol.in/ETaskTest'
let G_IsCompanyValidate = false;
let G_Goligin = false;
let G_OTP = false;
let G_ValidatePassword = false;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
$(document).ready(function () {
    $('#txtCompanyCode').on('keydown', function (e) {
        if (e.key === "Enter") {
            CheckCompany();
        }
    });
    $('#txtUserID').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtPassword").focus();
        }
    });
    $('#txtForgetCompanyCode').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtForgetUserID").focus();
        }
    });
    $('#txtForgetUserID').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnGetOtp").focus();
        }
    });
    $('#txtPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnProceed").focus();
        }
    });
    $('#btnProceed').click(function () {
        Login();
    });
    $('#btnGetOtp').click(function () {
        SendOtp();
    });
    $('#btnGetOtp1').click(function () {
        SendOtp();
    });
    $('#txtOtp').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnSubmit").focus();
        }
    });
    let companyCode = getCookie('ETaskCompanyCode');
    if (companyCode) {
        $('#txtCompanyCode').val(companyCode);
    } else {
        console.warn("CompanyCode cookie not found!");
    }
    $("#forgotpassword").click(function () {
        FogetPassword();
    });
    $("#btnBack").click(function () {
        Back();
    });
    $("#btnSubmit").click(function () {
        CheckOtp();
    });
    let RememberMe = getCookie1("ETaskIsRememberMe");
    if (RememberMe != '') {
        let decodedStr = decodeURIComponent(RememberMe);
        let parts = decodedStr.split("()");
        $('#txtUserID').val(parts[1]);
        $('#txtPassword').val(parts[2]);
    }
});
function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
function CheckCompany() {
    let CompanyCode = $("#txtCompanyCode").val();
    if (CompanyCode.trim() === "") {
        toastr.error("Please enter a Company Code.!");
        return;
    }
    $.ajax({
        url: `${AppBaseURLMenu}/Login/ValidateCompanyCode`,
        type: 'POST',
        data: { CompanyCode: CompanyCode },
        success: function (response) {
            if (response.success) {
                G_IsCompanyValidate = true;
                $('#txtCompanyCode').prop('readonly', true);
                $("#txtUserID").focus();
                if (G_Goligin) {
                    Login();
                }
                if (G_OTP) {
                    SendOtp();
                }

            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("An error occurred while validating the company code. Please try again.");
        }
    });
}
function Login() {
    var CompanyCode = $('#txtCompanyCode').val();
    var UserID = $('#txtUserID').val();
    var Password = $('#txtPassword').val();
    var RememberMe = $('#chkIsRememberMe').is(":checked") ? 'Y' : 'N';
    if (CompanyCode.trim() === "") {
        toastr.error("Please enter Company Code.!");
        $('#txtCompanyCode').focus();
        return;
    } else if (UserID.trim() === "") {
        toastr.error("Please enter User Id.!");
        $('#txtUserID').focus();
        return;
    } else if (Password.trim() === "") {
        toastr.error("Please enter Password.!");
        $('#txtPassword').focus();
        return;
    }
    if (!G_IsCompanyValidate) {
        CheckCompany();
        G_Goligin = true;
        return;
    }

    $.ajax({
        url: `${AppBaseURLMenu}/Login/Authenticate`,
        type: 'POST',
        data: { CompanyCode: CompanyCode, UserID: UserID, Password: Password, RememberMe: RememberMe },
        success: function (response) {
            if (response.success && response.isFirstLogin == 'N') {
                window.location.href = `${AppBaseURLMenu}/Dashboard/Dashboard`;
              
            } else if (response.success && response.isFirstLogin == 'Y') {
                window.location.href = `${AppBaseURLMenu}/login/ChangePassword`;
            }
            else {
                toastr.error(response.message);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred. Please try again.");
        }
    });
}
function Back() {
    $("#dvLogin").show();
    $("#dvForgetPassword").hide();
    $("#dvOTP").hide();
    $("#dvAfterGetOtp").hide();
    $("#dvBeforeGetOtp").show();
    $("#hfOtp").val("");
    $("#txtMsg").text("");
}
function FogetPassword() {
    $("#dvLogin").hide();
    $("#dvForgetPassword").show();
    $('#txtForgetCompanyCode').val($('#txtCompanyCode').val())
}
function SendOtp() {
    var CompanyCode = $('#txtForgetCompanyCode').val();
    var UserID = $('#txtForgetUserID').val();
    if (CompanyCode.trim() === "") {
        toastr.error("Please enter Company Code.!");
        $('#txtForgetCompanyCode').focus();
        return;
    } else if (UserID.trim() === "") {
        toastr.error("Please enter User Id.!");
        $('#txtForgetUserID').focus();
        return;
    }
    if (!G_IsCompanyValidate) {
        CheckCompany();
        G_OTP = true;
        return;
    }
    $.ajax({
        url: `${AppBaseURLMenu}/Login/SendOTP`,
        type: 'POST',
        data: { CompanyCode: CompanyCode, UserID: UserID },
        success: function (response) {
            if (response.status == "Y") {
                $("#dvOTP").show();
                $("#hfOtp").val(response.otp);
                $("#dvAfterGetOtp").show();
                $("#dvBeforeGetOtp").hide();
                $("#txtMsg").text(response.msg);
                alert(response.otp);
                $('#txtOtp').focus();
            } else if (response.status == 'N') {
                $("#dvOTP").hide();
                $("#dvAfterGetOtp").hide();
                $("#dvBeforeGetOtp").show();
                $("#hfOtp").val("");
                $("#txtMsg").text(response.msg);
            }
            else {
                $("#dvOTP").hide();
                $("#dvAfterGetOtp").hide();
                $("#dvBeforeGetOtp").show();
                $("#hfOtp").val("");
                $("#txtMsg").text(response.message);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred. Please try again.");
        }
    });
}
function CheckOtp() {
    var OTP = $("#hfOtp").val();
    var InputOTP = $("#txtOtp").val();
    if (InputOTP == '') {
        toastr.error("Please enter OTP.!");
        $('#txtOtp').focus();
        return;
    }
    if (OTP === InputOTP) {
        window.location.href = `${AppBaseURLMenu}/Login/ResetPassword`;
    } else {
        alert("Invalid OTP.");
        $('#txtOtp').focus();
    }
}
function getCookie1(name) {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}
function Create() {
    var CompanyCode = $('#txtModalCompanyCode').val();
    var CompanyName = $('#txtModalCompanyName').val();
    var Email = $('#txtModalEmailid').val();
    var MobileNo = $('#txtModalMobileNo').val();
    if (CompanyCode.trim() === "") {
        toastr.error("Please enter a Company Code.!");
        $("#txtModalCompanyCode").focus();
        return;
    }
    //else if (CompanyName.trim() === "") {
    //    toastr.error("Please enter a Employee Name.!");
    //    $("#txtModalCompanyName").focus();
    //    return;
    //}else if (Email.trim() === "") {
    //    toastr.error("Please enter a Email.!");
    //    $("#txtModalEmailid").focus();
    //    return;
    //}else if (MobileNo.trim() === "") {
    //    toastr.error("Please enter a Mobile No.!");
    //    $("#txtModalMobileNo").focus();
    //    return;
    //}
    else {
        $.ajax({
            url: `${AppBaseURLMenu}/Company/CreateNewCompany`,
            type: 'POST',
            data: { CCode: CompanyCode, CompanyName: CompanyName, Email: Email, MobileNo: MobileNo },
            success: function (response) {
                if (response.ErrorMsg === "" || response.ErrorMsg == null) {
                    toastr.success("New company has been created!");
                    //$('#attachmentModal').hide();
                    //$("#txtcreatecompany").hide();
                    window.location.href = `${AppBaseURLMenu}/Login/Login`;
                } else {
                    toastr.error("New company not created! Error: " + response.ErrorMsg);
                }
            },
            error: function (xhr, status, error) {
                toastr.error("AJAX request failed: " + error);
            }
           
        });
    }

}
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        openMyPopup();
    }
});
function openMyPopup() {
    $("#attachmentModal").show();
}
function closeMyPopup() {
    $('#attachmentModal').hide()
    $("#txtValidatePassword").val("");
    $("#txtcreatecompany").hide();
}

function ValidatePassword() {
    let Password = $("#txtValidatePassword").val();
    if (Password.trim() === "") {
        toastr.error("Please enter a Password.!");
        $("#txtValidatePassword").focus();
        return;
    } else {
        $.ajax({
            url: `${AppBaseURLMenu}/Login/ValidatePassword`,
            type: 'POST',
            data: { Password: Password },
            success: function (response) {
                if (response.success) {
                    $('#txtValidatePassword').prop('readonly', true);
                    $("#txtValidateP").hide();
                    $("#txtcreatecompany").show();
                } else {
                    toastr.error(response.message);
                }
            },
            error: function () {
                toastr.error("An error occurred while validating the Password. Please try again.");
            }
        });
    }
}
