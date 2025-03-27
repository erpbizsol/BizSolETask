let AppBaseURLMenu = window.location.href.toLowerCase().includes('local') == true ? 'https://localhost:7077' : 'https://web.bizsol.in/esms'
let G_IsCompanyValidate = false;
let G_Goligin = false;
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
        ForgetPasswordOtp();
    });
  
    let companyCode = getCookie('CompanyCode');
    if (companyCode) {
        $('#txtCompanyCode').val(companyCode);
    } else {
        console.warn("CompanyCode cookie not found!");
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
    if (CompanyCode.trim() === "") {
        toastr.error("Please enter a Company Code.!");
        $('#txtCompanyCode').focus();
        return;
    } else if (UserID.trim() === "") {
        toastr.error("Please enter a User Id.!");
        $('#txtUserID').focus();
        return;
    } else if (Password.trim() === "") {
        toastr.error("Please enter a Password.!");
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
        data: { CompanyCode: CompanyCode, UserID: UserID, Password: Password},
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

}