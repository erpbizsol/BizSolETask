var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
const appBaseURL = sessionStorage.getItem('AppBaseURL');
const AppBaseURLMenu = sessionStorage.getItem('AppBaseURLMenu');

$(document).ready(function () {
    $("#ERPHeading").text("Config");
    $('#txtClientName').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtWorkType").focus();
        }
    });
    $('#txtWorkType').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtsave").focus();
        }
    });
    Edit();
});
$("#txtsave").click(function () {
    Save();
})
function Save() {
    var ClientName = $("#txtClientName").val();
    var WorkType = $("#txtWorkType").val();
    var TaskNature = $("#txtTaskNature").val();
    var Priority = $("#txtPriority").val();
    var MenuName = $("#txtMenuName").val();

    if (!ClientName) {
        toastr.error('Please enter a Client Name!');
        $("#txtClientName").focus();
        return;
    }
    else if (!WorkType) {
        toastr.error('Please enter Work Type!');
        $("#txtWorkType").focus();
        return;
    }
    else if (!TaskNature) {
        toastr.error('Please select Task Nature!');
        $("#txtTaskNature").focus();
        return;
    }
    else if (!Priority) {
        toastr.error('Please select Priority!');
        $("#txtPriority").focus();
        return;
    }
    else if (!MenuName) {
        toastr.error('Please select Menu Name!');
        $("#txtMenuName").focus();
        return;
    }
    const payload = {
        Code: $("#hfCode").val() || 0,
        ClientMaster: ClientName,
        WorkType: WorkType,
        TaskNature: TaskNature,
        Priority: Priority,
        MenuName: MenuName
    };

    $.ajax({
        url: `${appBaseURL}/api/Master/SaveConfigMaster`,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response[0].Status === 'Y') {
                toastr.success(response[0].Msg);
                Edit();
            }
            else {
                toastr.error(response[0].Msg);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred while saving the data.");
        }
    });
}

function Edit() {
    $.ajax({
        url: `${appBaseURL}/api/Master/ShowConfig`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (items) {

            if (Array.isArray(items) && items.length > 0) {
                items.forEach(function (item, index) {
                    if (index === 0) {
                        $("#hfCode").val(item.Code || "");
                        $("#txtClientName").val(item.Department || "");
                        $("#txtWorkType").val(item.WorkType || "");
                        $("#txtTaskNature").val(item.TaskNature || "");
                        $("#txtPriority").val(item.Priority || "");
                        $("#txtMenuName").val(item.MenuName || "");
                    }
                });
            } else {
                toastr.error("Record not found...!");
            }
        },
    });
}
