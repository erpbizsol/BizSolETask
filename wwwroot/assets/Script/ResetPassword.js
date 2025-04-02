let AppBaseURLMenu = window.location.href.toLowerCase().includes('local') == true ? 'https://localhost:7077' : 'https://web.bizsol.in/EtaskTest'
let G_IsCompanyValidate = false;
let G_Goligin = false;
$(document).ready(function () {
    $('#txtNewPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtNewConfirmPassword").focus();
        }
    });
    $('#txtNewConfirmPassword').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnSave").focus();
        }
    });
    $('#btnSave').click(function () {
        ResetPassword();
    });
    $('#btnBack').click(function () {
        window.location.href = `${AppBaseURLMenu}/Login/Login`;
    });
});
function ResetPassword() {
    var NewPassword = $('#txtNewPassword').val();
    var ConfirmNewPassword = $('#txtNewConfirmPassword').val();
    if (NewPassword === "") {
        toastr.error("Please enter New Password.!");
        $('#txtNewPassword').focus();
        return;
    } else if (ConfirmNewPassword === "") {
        toastr.error("Please enter Confirm New Password.!");
        $('#txtNewConfirmPassword').focus();
        return;
    } else if (ConfirmNewPassword !== NewPassword) {
        toastr.error('Your password and confirmation password do not match.');
        $("#txtNewPassword").focus();
        return;
    }

    $.ajax({
        url: `${AppBaseURLMenu}/Login/ResetPassword`,
        type: 'POST',
        data: { Password: NewPassword },
        success: function (response) {
            if (response[0].Status == 'Y') {
                $("#txtMsg").text(response[0].Msg);
                $("#dvMsg").show();
            } else {
                toastr.error(response[0].Msg);
                $("#dvMsg").hide();
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred. Please try again.");
        }
    });
}
