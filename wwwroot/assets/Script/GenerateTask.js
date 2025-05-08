var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
const fileInput = document.getElementById('txtAttachment');

let AttachmentDetail = [{
    CallTicketMaster_Code: 0,
    attachment: [],
    attachmentFileName: ".png",
}];
$(document).ready(async function () {
    $("#ERPHeading").text("Generate Task");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
    DatePicker();
    await GetTicketType();
    await GetTicketNo();
    await GetPriorityDetails();
    await GetClientMasterDetails();
    await GetWorkTypes();
    await GetAssigneds();
    $("#txtTaskType").change(function () {
        var selectedValue = $(this).val();
        if (selectedValue === "1") {
            $("#txtTaskNoDiv").hide();
        } else {
            $("#txtTaskNoDiv").show();
        }
    });

});
function GetTicketType() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketType`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtTaskType');
            $select.empty();
            $.each(response, function (index, item) {
                $select.append(`<option value="${item.Code}">${item.TicketType}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtTaskType').empty();
        }
    });
}
function GetTicketNo() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketNo`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtTaskNo');
            $select.empty();
            if (response && response.length > 0) {
                $select.append(new Option("Select Ticket No...", "", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.UID));
                });
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Ticket No...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtTaskNo').empty();
        }
    });
}
function GetPriorityDetails() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetPriorityDetails`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtPriority');
            $select.empty();
            $select.append('<option value="">Select Priority</option>');
            $.each(response, function (index, item) {
                $select.append(`<option value="${item.Code}">${item.Priority}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtPriority').empty();
        }
    });
}
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);

    $('#txtLogDate,#txtCommittedDate').val(defaultDate);
    $('#txtLogDate,#txtCommittedDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    });
}
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function GetClientMasterDetails() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetClientMasterDetails`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtProjectClient');
            $select.empty();
            if (response && response.length > 0) {
                $select.append(new Option("Select Project Client..", true, true));
                $.each(response, function (index, item) {
                    $select.append(`<option value="${item.Code}">${item.ClientName}</option>`);
                   // $select.append(new Option(item.ClientName, item.Code));
                });
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Project Client...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtProjectClient').empty();
        }
    });
}
function GetWorkTypes() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypes`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtWorkType');
            $select.empty();
            if (response && response.length > 0) {
                //$select.append(new Option("Select Work Type..", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.WorkType, item.Code));
                });
                WorkType = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Work Type...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtWorkType').empty();
        }
    });
}
function GetAssigneds() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssigneds`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtAssigned');
            $select.empty();
            if (response && response.length > 0) {
                // $select.append(new Option("Select Assigned..", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.EmployeeName, item.Code));
                });
                Assigned = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                placeholder: "Select Assigned...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtAssigned').empty();
        }
    });
}

$("#txtAttachment").on('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const fileName = files[0].name;
        console.log('File name:', fileName);
    }
});
$('#txtAttachment').bind('change', function () {
    //let fileName = document.getElementById('txtAttachment').files[0].name;
    $.each($('#txtAttachment')[0].files, function (key, file) {

        // If file size > 500kB, resize such that width <= 1000, quality = 0.9
        OptimizeImage.reduceFileSize(file, 500 * 1024, 1000, Infinity, 0.9, blob => {

            ConvertFileToByteArry(blob).then(function (ByteArray) {
                AttachmentDetail.push({
                    CallTicketMaster_Code: 0,
                    attachment: ByteArray,
                    attachmentFileName: [],
                });
            });

        });

    });
});
function ConvertFileToByteArry(File) {
    return new Promise(function (resolve, reject) {
        var fileByteArray = [];
        var reader = new FileReader();

        reader.readAsArrayBuffer(File);
        reader.onloadend = function (evt) {
            if (evt.target.readyState == FileReader.DONE) {
                var arrayBuffer = evt.target.result,
                    array = new Uint8Array(arrayBuffer);
                for (var i = 0; i < array.length; i++) {
                    fileByteArray.push(array[i]);
                }
                resolve(fileByteArray);
            }
        }
    });
}
function SaveData() {
    let Code = $("#hftxtCode").val();
    let TaskType = $("#txtTaskType").val();
    let TicketNo = $("#txtTaskNo").val();
    let Priority = $("#txtPriority").val();
    let LogDate = $("#txtLogDate").val();
    let ProjectClient = $("#txtProjectClient").val();
    let WorkType = $("#txtWorkType").val();
    let Description = $("#txtDescription").val();
    let Assigned = $("#txtAssigned").val();
    let CommittedDate = $("#txtCommittedDate").val();
    let EstimatedTime = $("#txtEstimatedTime").val();
    if (TaskType == "") {
        toastr.error('Please select Task Type.');
        $("#txtTaskType").focus();
        return;
    } else if (Priority == "") {
        toastr.error('Please select Priority.');
        $("#txtPriority").focus();
        return;
    } else if (ProjectClient == "") {
        toastr.error('Please select Project / Client.');
        $("#txtProjectClient").focus();
        return;
    } else if (WorkType == "") {
        toastr.error('Please select Work Type.');
        $("#txtWorkType").focus();
        return;
    } else if (Assigned == "") {
        toastr.error('Please select Assigned.');
        $("#txtAssigned").focus();
        return;
    } else {
        let Postdata =
        {
            generateTask: [
                {
                    code: Code,
                    ticketTypeMaster_Code: TaskType,
                    TicketNo: TicketNo,
                    employeeMaster_Code: 0,
                    priorityMaster_Code: Priority,
                    logDate: LogDate,
                    clientMaster_Code: ProjectClient,
                    moduleMaster_Code: 0,
                    bizSolUserMaster_Code: UserMaster_Code,
                    sourceMaster_Code: 0,
                    workTypeMaster_Code: WorkType,
                    description: Description,
                    reAssign_Code: Assigned,
                    commitedDate: CommittedDate,
                    estimatedTime: EstimatedTime,
                    statusMaster_Code: 0,
                    commonColumn: 'A',
                    status: 'P',
                    userMaster_Code: UserMaster_Code,
                }
            ],
            Attachment: AttachmentDetail
        };
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveGenerateTaskTicket`,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(Postdata),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Auth-Key", authKeyData);
            },
            success: function (response) {
                if (response[0].Status === "Y") {
                    toastr.success(response[0].Msg);
                }
                else {
                    toastr.error(response[0].Msg);
                }
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
            }
        });
    }
}