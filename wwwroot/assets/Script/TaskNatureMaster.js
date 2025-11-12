var authKeyData = sessionStorage.getItem('authKey');
var jsonObject = JSON.parse(authKeyData);
let UserMaster_Code = jsonObject.UserMaster_Code;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let G_JsonData = [];

$(document).ready(function () {
    ShowTaskNatureMaster('Load');
    $("#ERPHeading").text("Task Nature Master");

    $('#txtNature').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#btnSave").focus();
        }
    });

    $("#btnSave").click(function () {
        Save();
    });

});

function ShowTaskNatureMaster(Type) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTaskNatureMasterList`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtNatureTable").show();

                const StringFilterColumn = ["Nature"];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code"];
                const ColumnAlignment = {};

                const updatedResponse = response.map(function (item) {
                    return {
                        ...item,
                        'Action': `
                    <button class="btn btn-danger icon-height mb-1" title="Delete" onclick="Delete('${item.Code}')"><i class="fa-solid fa-trash"></i></button>
                    <button class="btn btn-primary icon-height mb-1 btn1" title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                    };
                });

                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
            } else {
                $("#txtNatureTable").hide();
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
    var Nature = $("#txtNature").val();
    var Code = $("#hfCode").val();

    if (Nature == "") {
        toastr.error('Please enter Nature.');
        $("#txtNature").focus();
        return;
    }

    const payload = {
        Code: Code,
        Nature: Nature,
        UserMaster_Code: UserMaster_Code
    };

    $.ajax({
        url: `${appBaseURL}/api/Master/SaveTaskNatureMaster`,
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
                ShowTaskNatureMaster('Get');
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
        }
    });
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
        url: `${appBaseURL}/api/Master/GetTaskNatureMasterByCode?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {
                $("#hfCode").val(response[0].Code);
                $("#txtNature").val(response[0].Nature);
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
    $("#txtNature").val("");
}

function Delete(code) {
    if (confirm(`Are you sure you want delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/DeleteTaskNatureMaster?Code=${code}`,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    ShowTaskNatureMaster('Get');
                } else {
                    toastr.error(response[0].Msg);
                }
            },
            error: function () {
                toastr.error("Cannot be deleted as it is referenced.");
            }
        });
    }
}
