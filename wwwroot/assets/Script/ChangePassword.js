let AppBaseURLMenu = window.location.href.toLowerCase().includes('local') == true ? 'https://localhost:7077' : 'https://web.bizsol.in/esms'
let G_IsCompanyValidate = false;
let G_Goligin = false;
$(document).ready(function () {
    $('#txtExistingPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtNewPassword").focus();
        }
    });
    $('#txtNewPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtConfirmNewPassword").focus();
        }
    });
    $('#txtConfirmNewPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $('#btnSave').focus();
        }
    });
    $('#btnSave').click(function () {
        ChangePassword();
    });
 });
function ChangePassword() {
    var ExistingPassword = $('#txtExistingPassword').val();
    var NewPassword = $('#txtNewPassword').val();
    var ConfirmNewPassword = $('#txtConfirmNewPassword').val();
    if (ExistingPassword.trim() === "") {
        toastr.error("Please enter Existing Password.!");
        $('#txtExistingPassword').focus();
        return;
    } else if (NewPassword.trim() === "") {
        toastr.error("Please enter New Password.!");
        $('#txtNewPassword').focus();
        return;
    } else if (ConfirmNewPassword.trim() === "") {
        toastr.error("Please enter Confirm New Password.!");
        $('#txtConfirmNewPassword').focus();
        return;
    } else if (ConfirmNewPassword !== NewPassword) {
        toastr.error('Your password and confirmation password do not match.');
        $("#txtNewPassword").focus();
        return;
    } else if (ExistingPassword === NewPassword) {
        toastr.error('New password cannot be the same as the existing password.');
        $("#txtNewPassword").focus();
        return;
    }

    $.ajax({
        url: `${AppBaseURLMenu}/Login/ChangePassword`,
        type: 'POST',
        data: { ExistingPassword: ExistingPassword, Password: NewPassword },
        success: function (response) {
            if (response[0].Status == 'Y') {
                toastr.success(response[0].Msg);
                window.location.href = `${AppBaseURLMenu}/Login/Login`;
            }else {
                toastr.error(response[0].Msg);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred. Please try again.");
        }
    });
}
