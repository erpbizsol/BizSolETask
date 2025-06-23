var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let IsLoad = true;
let fileName;
let AttachmentDetail = [];
let G_WorkTypeList = [];
let G_EmployeeNameList = [];
let G_ProjectList = [];
let G_TicketTypetList = [];
let G_PriorityList = [];
$(document).ready(async function () {
    $("#ERPHeading").text("Generate Task");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
    $('#txtTaskType').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtPriority").focus();
        }
    });
    $('#txtPriority').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtProjectClient").focus();
        }
    });
    $('#txtProjectClient').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtWorkType").focus();
        }
    });
    $('#txtWorkType').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtDescription").focus();
        }
    });
    $('#txtDescription').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtAttachment").focus();
        }
    });
    $('#txtAttachment').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtAssigned").focus();
        }
    });
    $('#txtAssigned').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtCommittedDate").focus();
        }
    });
    $('#txtCommittedDate').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtEstimatedTime").focus();
        }
    });
    $('#txtEstimatedTime').on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtbtn").focus();
        }
    });
    DatePicker();
    await GetTicketType();
    await GetTicketNo();
    await GetPriorityDetails();
    await GetClientMasterDetails();
    await GetWorkTypes();
   // await GetAssigneds();
    $("#txtTaskType").change(function () {
        var selectedValue = $(this).val();
        if (selectedValue === "1") {
            $("#txtTaskNoDiv").hide();
        } else {
            $("#txtTaskNoDiv").show();
        }
    });

    GetGenerateTaskTicketDateList('Get');
    if (UserTypes == "A") {
        $("#txtAllUser").show();
    } else {
        $("#txtAllUser").hide();
    }
});

$('input[name="ticktOrder"], input[name="ticktOrderStatus"]').on('change', function () {
    GetGenerateTaskTicketDateList('Get');
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
            //if (Array.isArray(response) && response.length > 0) {
            //    G_TicketTypetList = response.map(item => ({
            //        Code: item.Code,
            //        Name: item.TicketType
            //    }));
            //} else {
            //    G_TicketTypetList = [];
            //}
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
              //  $select.append(new Option("Select Ticket No...", "", true, true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.UID));
                });
               
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                //placeholder: "Select Ticket No...",
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
           // $select.append('<option value="">Select Priority</option>');
            $.each(response, function (index, item) {
                $select.append(`<option value="${item.Code}">${item.Priority}</option>`);
            });
            if (Array.isArray(response) && response.length > 0) {
                G_PriorityList = response.map(item => ({
                    Code: item.Code,
                    Name: item.Priority
                }));
            } else {
                G_PriorityList = [];
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtPriority').empty();
        }
    });
}
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${day}-${monthAbbreviation}-${year}`;
}
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);

    $('#txtLogDate,#txtCommittedDate').val(defaultDate);
    $('#txtLogDate,#txtCommittedDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        orientation: 'bottom auto',
        todayHighlight: true
    }).on('show', function () {
        let $input = $(this);
        let inputOffset = $input.offset();
        let inputHeight = $input.outerHeight();
        let inputWidth = $input.outerWidth();
        setTimeout(function () {
            let $datepicker = $('.datepicker-dropdown');
            $datepicker.css({
                width: inputWidth + 'px',
                top: (inputOffset.top + inputHeight) + 'px',
                left: inputOffset.left + 'px'
            });
        }, 10);
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
                $select.append(new Option("Select Project Client..", "0", true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.ClientName, item.Code));
                });
                ClientName = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                // placeholder: "Select Project Client...",
                allowClear: true
            });
            if (Array.isArray(response) && response.length > 0) {
                G_ProjectList = response.map(item => ({
                    Code: item.Code,
                    Name: item.ClientName
                }));
            } else {
                G_ProjectList = [];
            }
          
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtWorkType').empty();
        }
    });
}
$('#txtProjectClient').on('change', function () {
    let selectedCode = $(this).val();
    if (selectedCode && selectedCode !== "0") {
        GetAssigneds(selectedCode);
    }
});
function GetWorkTypes() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetWorkTypes`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_WorkTypeList = response.map(item => ({
                    Code: item.Code,
                    Name: item.WorkType
                }));
            } else {
                G_WorkTypeList = [];
            }
            const $select = $('#txtWorkType');
            $select.empty();
            if (response && response.length > 0) {
               $select.append(new Option("Select Work Type..", "0", true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.WorkType, item.Code));
                });
                WorkType = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                //placeholder: "Select Work Type...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtWorkType').empty();
        }
    });
}
function GetAssigneds(selectedCode) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssigneds?Code=${selectedCode}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_EmployeeNameList = response.map(item => ({
                    Code: item.Code,
                    Name: item.EmployeeName
                }));
            } else {
                G_EmployeeNameList = [];
                toastr.error("No employees found.");
            }
            const $select = $('#txtAssigned');
            $select.empty();
            if (response && response.length > 0) {
                 $select.append(new Option("Select Assigned..", "0", true));
                $.each(response, function (index, item) {
                    $select.append(new Option(item.EmployeeName, item.Code));
                });
                Assigned = response.Code;
            }
            $select.select2({
                width: '100%',
                closeOnSelect: false,
                //placeholder: "Select Assigned...",
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
    }
});
$('#txtAttachment').bind('change', function () {
    
    $.each($('#txtAttachment')[0].files, function (key, file) {
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
    let LogDate = convertDateFormat($("#txtLogDate").val());
    let ProjectClient = $("#txtProjectClient").val();
    let WorkType = $("#txtWorkType").val();
    let Description = $("#txtDescription").val();
    let Assigned = $("#txtAssigned").val();
    let CommittedDate = convertDateFormat($("#txtCommittedDate").val());
    let EstimatedTime = $("#txtEstimatedTime").val();
    if (TaskType == "") {
        toastr.error('Please Select Task Type.');
        $("#txtTaskType").focus();
        return;
    } else if (Priority == "") {
        toastr.error('Please Select Priority.');
        $("#txtPriority").focus();
        return;
    } else if (ProjectClient == "0" || ProjectClient == undefined) {
        toastr.error('Please Select Project / Client.');
        $("#txtProjectClient").focus();
        return;
    } else if (WorkType == "0") {
        toastr.error('Please Select Work Type.');
        $("#txtWorkType").focus();
        return;
    } else if (Assigned == "0") {
        toastr.error('Please Select Assigned.');
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
                    estimatedTime: EstimatedTime ||0,
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
                    ClearData();
                    GetGenerateTaskTicketDateList('Get');
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
    let TaskNo = $("#txtTaskNo").val();
    TaskNo = TaskNo ? TaskNo.value : 0; 
        $.ajax({
            url: `${appBaseURL}/api/Master/GetGenerateTaskTicketDate?EmployeeName=${EmployeeName}&showBy=${showBy}&Status=${Status}&ticketNo=${TaskNo}`,
            type: 'POST',
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response.length > 0) {
                    $("#txtSummary").show();
                    const StringFilterColumn = [];
                    const NumericFilterColumn = [];
                    const DateFilterColumn = ["Log Date"];
                    const Button = false;
                    const showButtons = [];
                    const StringdoubleFilterColumn = [];
                    const hiddenColumns = ["ACode","Attachment","CallTicketMaster_Code","AttachmentFileName","ResolutionTime","Remarks","ResolvedDate","RaisedBy","Module","Source","FirstCheckBy","CommitedDate","ContactNo","Status","EstimatedTime", "UpdateBy", "Priority", "TicketType", "UpdateDate", "ResolvedBy", "FinalCheckBy", "StatusName", "WorkType","ContactEMail","ClientMaster_Code", "ModuleMaster_Code", "ResolvedBy_Code", "SourceMaster_Code", "WorkTypeMaster_Code","EmployeeMaster_Code","Code"];
                    const ColumnAlignment = {
                    };
                    const updatedResponse = response.map(item => {
                        let actionButtons = `
                            <a class="btn btn-success icon-height" title="View Attachment" onclick="ViewAttachment('${item.Code}')">
                            <i class="fa fa-paperclip"></i>
                            </a>
                            <button class="btn btn-primary icon-height mb-1" style="background:#20425d" title="Edit" onclick="Edit('${item.Code}')">
                            <i class="fa-solid fa-pencil"></i>
                            </button>`;

                        if (UserTypes === 'A') {

                        actionButtons += `
                            <button class="btn btn-danger icon-height mb-1" title="Delete" onclick="Delete('${item.Code}')">
                            <i class="fa-solid fa-trash"></i>
                            </button>`;
                        }

                        return {
                            ...item,
                            'Action': actionButtons
                        };
                    });
                    //const updatedResponse = response.map(item => ({
                    //    ...item, 'Action':
                    //       `
                    //<a class= "btn btn-success icon-height" title="View Attachment" onclick="ViewAttachment('${item.Code}')" > <i class="fa fa-paperclip"></i></a>
                    //<button class="btn btn-primary icon-height mb-1" style="background:#20425d"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>
                    //<button class="btn btn-danger icon-height mb-1"  title="Delete" onclick="Delete('${item.Code}')"><i class="fa-solid fa-trash"></i></button>`
                    //}));
                   
                    BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);

                } else {
                    if (Type == 'Get') {
                        toastr.error("Record not found...!");
                        $("#txtSummary").hide();
                    }
                    
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });
    
}
function BindSelect2(elementId, list) {
    let option = '<option value="0">Select</option>';
    $.each(list, function (key, val) {

        option += '<option value="' + val.Code + '">' + val.Name + '</option>';
    });

    $('#' + elementId)[0].innerHTML = option;

    $('#' + elementId).select2({
        width: '100%'
    });
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
                $("#txtLogDate").val(response[0].LogDate);
                $("#txtDescription").val(response[0].Description);
                $("#txtCommittedDate").val(response[0].CommitedDate);
                $("#txtEstimatedTime").val(response[0].EstimatedTime);
                $("#txtProjectClient").val(response[0].ProjectClient);
                $("#txtWorkType").val(response[0].WorkType);
                $("#txtAssigned").val(response[0].Assigned);
                $("#txtPriority").val(response[0].Priority);
                $("#txtTaskType").val(response[0].TicketTypeMaster_Code);
                $("#txtPriority").val(response[0].PriorityMaster_Code);
                //SelectOptionByText("txtProjectClient", item.ClientMaster_Code);
                //SelectOptionByText("txtWorkType", item.WorkTypeMaster_Code);
                //SelectOptionByText("txtAssigned", item.EmployeeMaster_Code);
                response.forEach(item => {
                    BindSelect2(`txtProjectClient`, G_ProjectList);
                    $(`#txtProjectClient`).val(item.ClientMaster_Code).select2({ width: '100%' });
                });
                response.forEach(item => {
                    BindSelect2(`txtWorkType`, G_WorkTypeList);
                    $(`#txtWorkType`).val(item.WorkTypeMaster_Code).select2({ width: '100%' });
                });
                response.forEach(item => {
                    BindSelect2(`txtAssigned`, G_EmployeeNameList);
                    $(`#txtAssigned`).val(item.EmployeeMaster_Code).select2({ width: '100%' });
                });
                //$("#txtProjectClient").val(response[0].ClientMaster_Code);
               // $("#txtWorkType").val(response[0].WorkTypeMaster_Code);
                //$("#txtAssigned").val(response[0].EmployeeMaster_Code);
         
             
                //$('#txtAttachment').off('change').on('change', function () {
                //    $.each(this.files, function (key, file) {
                //        const fileName = file.name;
                //        reduceFileSize(file, 500 * 1024, 1000, Infinity, 0.9, blob => {
                //            ConvertFileToByteArry(blob).then(function (ByteArray) {
                //                AttachmentDetail.push({
                //                    CallTicketMaster_Code: 0,
                //                    attachment: ByteArray,
                //                    attachmentFileName: fileName,
                //                });
                //            });
                //        });
                //    });
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

function ViewAttachment(code) {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAttachment?Code=${code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const container = $('#attachmentContainer');
            container.empty();

            if (response && Array.isArray(response) && response.length > 0) {
                response.forEach(item => {
                    const fileName = item.AttachmentFileName;
                    const attachmentCode = item.Code;
                    const attachmentBase64 = item.Attachment; // base64 string

                    const row = `
                        <div class="attachment-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding: 10px 0;">
                            <a href="#" style="color: #007bff;" onclick="onAttachmentClick('${fileName}', '${attachmentBase64}','${attachmentCode}','Y')">${fileName}</a>
                        </div>
                    `;
                    container.append(row);
                });

                $('#attachmentModal').show();
            } else {
                container.append('<p>No attachments found.</p>');
                toastr.warning("No attachment found.");
            }
        },
        error: function () {
            toastr.error("Failed to retrieve attachments.");
        }
    });
}
function onAttachmentClick(fileName, base64Data, code, download) {
    let isOpen = false;

    // Remove data URL prefix if exists
    if (base64Data.startsWith("data:")) {
        base64Data = base64Data.split(',')[1];
    }
    // Decode Base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Infer MIME type
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
        txt: 'text/plain',
        png: 'image/png',
        gif: 'image/gif',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg'
    };
    const mimeType = mimeTypes[extension] || 'application/octet-stream';

    const blob = new Blob([byteArray], { type: mimeType });

    const viewableTypes = ['txt', 'png', 'gif', 'jpeg', 'jpg'];
    const url = URL.createObjectURL(blob);
    if (viewableTypes.includes(extension)) {
        const newTab = window.open();
        if (newTab) {
            newTab.document.write(`<img src="${url}" style="max-width: 50%; display: block; margin: auto;">`);
            newTab.document.close();
        } else {
            window.open(url, '_blank');
        }
        // Delay revoking to allow loading
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    } else {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
function ClearData() {
    $("#hftxtCode").val("0");
    $("#txtTaskType").val("1");
    $("#txtTaskNo").val("");
    $("#txtPriority").val("2");
    $("#txtProjectClient").val("").trigger('change');
    $("#txtWorkType").val("").trigger('change');
    $("#txtDescription").val("");
    $("#txtAssigned").val("").trigger('change');
    $("#txtEstimatedTime").val("");
    $("#txtAttachment").val("");
    AttachmentDetail = [];
    DatePicker();
}
function GetAllDetailsTicketNo() {
   var TicketNo=$("#txtTaskNo").val();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketsDetails?TicketNo=${TicketNo}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            $("#txtLogDate").val(response[0].LogDate);
            $("#txtDescription").val(response[0].Description);
            $("#txtProjectClient").val(response[0].ClientMaster_Code);
            $("#txtWorkType").val(response[0].WorkTypeMaster_Code);
            $("#txtAssigned").val(response[0].EmployeeMaster_Code);
           
            response.forEach(item => {
                BindSelect2(`txtProjectClient`, G_ProjectList);
                $(`#txtProjectClient`).val(item.ClientMaster_Code).select2({ width: '100%' });
            });
            response.forEach(item => {
                BindSelect2(`txtWorkType`, G_WorkTypeList);
                $(`#txtWorkType`).val(item.WorkTypeMaster_Code).select2({ width: '100%' });
            });
            response.forEach(item => {
                BindSelect2(`txtAssigned`, G_EmployeeNameList);
                $(`#txtAssigned`).val(item.EmployeeMaster_Code).select2({ width: '100%' });
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtWorkType').empty();
        }
    });
}
$("#txtTaskNo").on('change', function () {
    GetAllDetailsTicketNo();
})
function Delete(code) {
    if (confirm(`Are you sure you want delete this.?`)) {
        $.ajax({
            url: `${appBaseURL}/api/Master/DeleteGenerateTask?Code=${code}`,
            type: 'Get',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (response) {
                if (response[0].Status === 'Y') {
                    toastr.success(response[0].Msg);
                    GetGenerateTaskTicketDateList('Get');
                } else {
                    toastr.error("Unexpected response format.");
                }
            },
            error: function (xhr, status, error) {
                toastr.error("Error deleting item:", Msg);
            }
        });
    }
}