var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');

$(document).ready(function () {
    $("#ERPHeading").text("Pending Task Report");

    $('input[type=radio][name=ticktOrderStatus]').change(function () {
        GetPendingTaskReport('Load');
    });
    Show();
});
function Show() {
    $('input:radio[name=ticktOrderStatus]').filter(function () {
        this.checked = false;
        GetPendingTaskReport('Load');
    });
    $('input:radio[name=ticktOrderStatus]').filter(function () {

        if (this.value == $('#hfStatus').val())
            this.checked = true;
        GetPendingTaskReport('Load');
    });
  
}
function GetPendingTaskReport(Type) {
    let Pending = $('input[type=radio][name="ticktOrderStatus"]:checked').val();

        $.ajax({
            url: `${appBaseURL}/api/Master/GetPendingTaskReport?Code=${UserMaster_Code}&Status=${Pending}`,
            type: 'POST',
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response.length > 0) {
                    $("#Table").show();
                    const StringFilterColumn = [""];
                    const NumericFilterColumn = [""];
                    const DateFilterColumn = [""];
                    const Button = false;
                    const showButtons = [""];
                    const StringdoubleFilterColumn = [""];
                    const hiddenColumns = ["WorkByCode", "ReAssign_Code", "TicketAssignedBy","CreateTicketBy_Code"];
                    const ColumnAlignment = {

                    };
                    BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body",response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
                } else {
                    $("#Table").hide();
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
