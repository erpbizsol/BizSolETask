var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let ticketFetchTimeout = null;
let currentEditCode = null; 

$(document).ready(function () {
    $("#ERPHeading").text("Tickets Rating Pending");
    TicketsRatingPending("Load");
});
function TicketsRatingPending(Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetPendingUnRatingTicket`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtTable").show();
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code"];
                const ColumnAlignment = {};
                const updatedResponse = response.map(item => {
                    const emailEscaped = (item.EmailId || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                    return {
                        Select: `<input type="checkbox" class="row-select-cb" data-code="${item.Code}" data-email="${emailEscaped}" title="Select for email">`,
                        ...item,
                        Action: `<button class="btn btn-primary icon-height mb-1 btn1" title="Edit" onclick="Edit('${item.Code}','${item.EmailId}')"><i class="fa-solid fa-pencil"></i></button>`
                    };
                });
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
            } else {
                $("#txtTable").hide();
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
function filterTickets(val) {
    document.querySelectorAll("#txtTable tbody tr")
        .forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? "" : "none");

}
function Edit(Code, Email) {
    currentEditCode = Code; 
    $('#txtEmail').val(Email);
    $('#attachmentModal1').show();
}
function Save() {
    if (!currentEditCode) {
        toastr.error("No record selected for editing.");
        return;
    }
    const updatedEmail = $('#txtEmail').val().trim();
    if (!updatedEmail) {
        toastr.error("Please enter an email address.");
        return;
    }
    const codeValue = parseInt(currentEditCode, 10);
    if (isNaN(codeValue)) {
        toastr.error("Invalid code value.");
        return;
    }
    const payload = {
        Code: codeValue,
        Email: updatedEmail
    };
    const authKey = typeof authKeyData === 'string' ? authKeyData : JSON.stringify(authKeyData);
    $.ajax({
        url: `${appBaseURL}/api/Master/UpdateEmail`,
        type: 'POST',
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKey);
        },
        success: function (response) {
            const msg = (response && response[0] && response[0].Msg) ? response[0].Msg : "Email updated successfully.";
            toastr.success(msg);
            $('#attachmentModal1').hide();
            $('#txtEmail').val('');
            currentEditCode = null;
            TicketsRatingPending("Load");
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
            let errorMsg = "Error updating email.";
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.errors) {
                    if (errorResponse.errors.Email) {
                        errorMsg = errorResponse.errors.Email[0];
                    } else if (errorResponse.errors[""]) {
                        errorMsg = errorResponse.errors[""][0];
                    }
                } else if (errorResponse.title) {
                    errorMsg = errorResponse.title;
                }
            } catch (e) {
                errorMsg = error || "Error updating email.";
            }
            toastr.error(errorMsg);
        }
    });
}

function SendEmail() {
    const checked = document.querySelectorAll('#table-body .row-select-cb:checked');
    if (!checked.length) {
        toastr.warning("Please select at least one row to send email.");
        return;
    }
    const codes = Array.from(checked).map(cb => parseInt(cb.getAttribute('data-code'), 10)).filter(c => !isNaN(c));
    if (!codes.length) {
        toastr.error("Invalid selection.");
        return;
    }
    
    $.ajax({
        url: `${appBaseURL}/api/Email/SendEmail`,
        type: 'POST',
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ codes: codes }),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const msg = (response && response[0] && response[0].Msg) ? response[0].Msg : "Email sent successfully.";
            toastr.success(msg);
            document.querySelectorAll('#table-body .row-select-cb:checked').forEach(cb => cb.checked = false);
            TicketsRatingPending("Load");
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
            let errorMsg = "Error sending email.";
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.errors && Object.keys(errorResponse.errors).length) {
                    const firstKey = Object.keys(errorResponse.errors)[0];
                    errorMsg = errorResponse.errors[firstKey][0];
                } else if (errorResponse.title) {
                    errorMsg = errorResponse.title;
                }
            } catch (e) { }
            toastr.error(errorMsg);
        }
    });
}

