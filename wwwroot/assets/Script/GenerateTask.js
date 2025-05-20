var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let IsLoad = true;
let fileName;
let AttachmentDetail = [{
    CallTicketMaster_Code: 0,
    attachment: [],
    attachmentFileName: "",
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
    $('input[type=radio][name=ticktOrder]').change(function () {
        GetGenerateTaskTicketDateList();
    });
    $('input[type=radio][name=ticktOrderStatus]').change(function () {
        GetGenerateTaskTicketDateList(this.value);

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
        fileName = files[0].name;
        AttachmentDetail[0].attachmentFileName = fileName;
        console.log('File name:', fileName);
    }
});
$('#txtAttachment').bind('change', function () {
    $.each($('#txtAttachment')[0].files, function (key, file) {

        // If file size > 500kB, resize such that width <= 1000, quality = 0.9
        reduceFileSize(file, 500 * 1024, 1000, Infinity, 0.9, blob => {

            ConvertFileToByteArry(blob).then(function (ByteArray) {
                AttachmentDetail.push({
                    CallTicketMaster_Code: 0,
                    attachment: ByteArray,
                    attachmentFileName: fileName,
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
function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality, callback) {
        if (file.size <= acceptFileSize) {
            callback(file);
            return;
        }
        let img = new Image();
        img.onerror = function () {
            URL.revokeObjectURL(this.src);
            callback(file);
        };
        img.onload = function () {
            URL.revokeObjectURL(this.src);
            getExifOrientation(file, function (orientation) {
                let w = img.width, h = img.height;
                let scale = (orientation > 4 ?
                    Math.min(maxHeight / w, maxWidth / h, 1) :
                    Math.min(maxWidth / w, maxHeight / h, 1));
                h = Math.round(h * scale);
                w = Math.round(w * scale);

                let canvas = imgToCanvasWithOrientation(img, w, h, orientation);
                canvas.toBlob(function (blob) {
                    console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
                    callback(blob);
                }, 'image/jpeg', quality);
            });
        };
        img.src = URL.createObjectURL(file);
 }
function getExifOrientation(file, callback) {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
        file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
        file = file.webkitSlice(0, 131072);
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) {
            callback(-2);
            return;
        }
        let length = view.byteLength, offset = 2;
        while (offset < length) {
            let marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    callback(-1);
                    return;
                }
                let little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                let tags = view.getUint16(offset, little);
                offset += 2;
                for (let i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        callback(view.getUint16(offset + (i * 12) + 8, little));
                        return;
                    }
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        callback(-1);
    };
    reader.readAsArrayBuffer(file);
}
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
    let canvas = document.createElement('canvas');
    if (orientation > 4) {
        canvas.width = rawHeight;
        canvas.height = rawWidth;
    } else {
        canvas.width = rawWidth;
        canvas.height = rawHeight;
    }

    if (orientation > 1) {
        console.log("EXIF orientation = " + orientation + ", rotating picture");
    }

    let ctx = canvas.getContext('2d');
    switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
    }
    ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
    return canvas;
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
                    ticketNo: TicketNo||0,
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
                    statusMaster_Code: 1,
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
function GetGenerateTaskTicketDateList(Type) {
    
    let EmployeeName = UserName;
    let showBy = $('input[type=radio][name="ticktOrder"]:checked').val();
    let Status = $('input[type=radio][name="ticktOrderStatus"]:checked').val();
    Status = Status ? Status.value : 0; 
    let TaskNo1 = "";
    if (IsLoad) {
        IsLoad = false;
        $('input:radio[name=ticktOrderStatus]').filter(function () {
            this.checked = false;

        });
        $('input:radio[name=ticktOrder]').filter(function () {
            this.checked = false;

        });

        $('input:radio[name=ticktOrderStatus]').filter(function () {

            if (this.value == $('#ticktOrderStatus').val())
                this.checked = true;

        });
        $('input:radio[name=ticktOrder]').filter(function () {
            if (this.value == $('#ticktOrder').val())
                this.checked = true;

        });
    } else {
        let showBy = $('input[type=radio][name="ticktOrder"]:checked').val();
        let Status = $('input[type=radio][name="ticktOrderStatus"]:checked').val();

        $.ajax({
            url: `${appBaseURL}/api/Master/GetGenerateTaskTicketDate?EmployeeName=${EmployeeName}&showBy=${showBy}&Status=${Status}&ticketNo=0`,
            type: 'POST',
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response.length > 0) {
                    $("#Table").show();
                    const StringFilterColumn = ["Assigned", "Description", "Work Type", "Project / Client","Ticket No"];
                    const NumericFilterColumn = [];
                    const DateFilterColumn = ["Log Date"];
                    const Button = false;
                    const showButtons = [];
                    const StringdoubleFilterColumn = [];
                    const hiddenColumns = ["ResolutionTime","Remarks","ResolvedDate","RaisedBy","Module","Source","FirstCheckBy","CommitedDate","ContactNo","Status","EstimatedTime", "UpdateBy", "Priority", "TicketType", "UpdateDate", "ResolvedBy", "FinalCheckBy", "StatusName", "WorkType","ContactEMail","ClientMaster_Code", "ModuleMaster_Code", "ResolvedBy_Code", "SourceMaster_Code", "WorkTypeMaster_Code","EmployeeMaster_Code","Code"];
                    const ColumnAlignment = {
                    };
                    const updatedResponse = response.map(item => ({
                        ...item, 'Action': `
                    <button class="btn btn-danger icon-height mb-1" style="background:#2da5ae" title="View" onclick="View('${item.Code}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-primary icon-height mb-1" style="background:#20425d"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                    }));
                    BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);

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
  
   
}
function Edit(code) {
    $.ajax({
        url: ` ${appBaseURL}/api/Master/GetGenerateTaskTicketByCode?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {
                $("#hftxtCode").val(response[0].Code);
                $("#txtTaskType").val(response[0].TicketType);
                $("#txtTaskNo").val(response[0].TicketNo);
                $("#txtPriority").val(response[0].Priority);
                $("#txtLogDate").val(response[0].LogDate);
                $("#txtProjectClient").val(response[0].ClientMaster_Code);
                $("#txtWorkType").val(response[0].WorkTypeMaster_Code);
                $("#txtDescription").val(response[0].Description);
                $("#txtAssigned").val(response[0].EmployeeMaster_Code);
                $("#txtCommittedDate").val(response[0].CommitedDate);
                $("#txtEstimatedTime").val(response[0].EstimatedTime);
                //response.forEach(item => {
                //    BindSelect2(`#txtPriority_${item.Code}`, G_DepartmentList);
                //    $(`#txtddlDipartment_${item.Code}`).val(item.ClientMaster_Code).select2({ width: '100%' });
                //});

                //response.forEach(item => {
                //    BindSelect2(`txtddlWorkType_${item.Code}`, G_WorkTypeList);
                //    $(`#txtddlWorkType_${item.Code}`).val(item.WorkTypeMaster_Code).select2({ width: '100%' });
                //});
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
//function BindSelect2(elementId, list) {
//    let option = '<option value="0">Select</option>';
//    $.each(list, function (key, val) {

//        option += '<option value="' + val.Code + '">' + val.Name + '</option>';
//    });

//    $('#' + elementId)[0].innerHTML = option;

//    $('#' + elementId).select2({
//        width: '100%'
//    });
//}