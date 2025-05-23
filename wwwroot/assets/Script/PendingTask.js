var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let IsLoad = true;
let G_StatussList = [];
let G_ResolvedByList = [];
let G_ReAssignList = [];
$(document).ready(async function () {
    $("#ERPHeading").text("Pending Task");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
   
    GetStatuss();
    $('input[type=radio][name=ticktOrder]').change(function () {
        GetGenerateTaskTicketDateList('Load');
    });
    $('input[type=radio][name=ticktOrderStatus]').change(function () {
        GetGenerateTaskTicketDateList(this.value);
    });
    DatePicker();
    
});
$("#txtStatus").on('change', function () {
    var Status = $("#txtStatus").val();
    if (Status == 2) {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtResolvedBy1").show();
        $("#txtUpdateBy").show();
        $("#txtAttachment").show();
        $("#txtReAssign1").hide();
        StatusType();
        GetResolvedBy();
    } else if (Status == 4) {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtReAssign1").show();
        $("#txtAttachment").show();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy").hide();
        StatusType();
        GetReAssign();
    } else {
        $("#txtTotalResolutionM1").hide();
        $("#txtResolutionDate").hide();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy").hide();
        $("#txtAttachment").hide();
        $("#txtReAssign1").hide();
    }

});
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
                    const StringFilterColumn = ["Assigned", "Description", "Work Type", "Project / Client", "Ticket No"];
                    const NumericFilterColumn = [];
                    const DateFilterColumn = ["Log Date"];
                    const Button = false;
                    const showButtons = [];
                    const StringdoubleFilterColumn = [];
                    const hiddenColumns = ["ACode", "Attachment", "CallTicketMaster_Code", "AttachmentFileName", "ResolutionTime", "Remarks", "ResolvedDate", "RaisedBy", "Module", "Source", "FirstCheckBy", "CommitedDate", "ContactNo", "Status", "EstimatedTime", "UpdateBy", "Priority", "TicketType", "UpdateDate", "ResolvedBy", "FinalCheckBy", "StatusName", "WorkType", "ContactEMail", "ClientMaster_Code", "ModuleMaster_Code", "ResolvedBy_Code", "SourceMaster_Code", "WorkTypeMaster_Code", "EmployeeMaster_Code", "Code"];
                    const ColumnAlignment = {
                    };
                    const updatedResponse = response.map(item => ({
                        ...item, 'Action':
                            `
                    <a class= "btn btn-success icon-height" title="View Attachment" onclick="ViewAttachment('${item.Code}')" > <i class="fa fa-paperclip"></i></a>
                    <button class="btn btn-primary icon-height mb-1" style="background:#20425d"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>
                    <button class="btn btn-primary icon-height mb-1" style="display:none"  title="StatusType" onclick="StatusType('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
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
function GetStatuss() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatuss`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            const $select = $('#txtStatus');
            $select.empty();
            $.each(response, function (index, item) {
                $select.append(`<option value="${item.Code}">${item.StatusDescription}</option>`);
            });
            if (Array.isArray(response) && response.length > 0) {
                G_StatussList = response.map(item => ({
                    Code: item.Code,
                    Name: item.StatusDescription
                }));
            } else {
                G_StatussList = [];
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtStatus').empty();
        }
    });
}

$("#txtBack").click(function () {
    $("#txtpage").hide();
    $("#txtTotalResolutionM1").hide();
    $("#txtResolutionDate").hide();
    $("#txtReAssign1").hide();
    $("#txtAttachment").hide();
    $("#txtResolvedBy1").hide();
    $("#txtUpdateBy").hide();
 
});

function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);

    $('#txtResolutionDates').val(defaultDate);
    $('#txtResolutionDates').datepicker({
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
function GetResolvedBy() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssigneds`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_ResolvedByList = response.map(item => ({
                    Code: item.Code,
                    Name: item.EmployeeName
                }));
            } else {
                G_ResolvedByList = [];
            }
            const $select = $('#txtResolvedBy');
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
                placeholder: "Select Resolved By...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtResolvedBy').empty();
        }
    });
}
function GetReAssign() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssigneds`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0) {
                G_ReAssignList = response.map(item => ({
                    Code: item.Code,
                    Name: item.EmployeeName
                }));
            } else {
                G_ReAssignList = [];
            }
            const $select = $('#txtReAssign');
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
                placeholder: "Select Resolved By...",
                allowClear: true
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#txtReAssign').empty();
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
function StatusType(code) {
  
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatusType?Code=36`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {
               // $("#txtStatus").val(response[0].Statuss);
                const item = response[0];

                // Text fields
                $("#txtTotalResolutionM").val(item.Times);
                $("#txtResolutionDates").val(item.Dates.split('T')[0]); // trim time
                $("#txtRemarks").val(item.Remarks);

                // Bind dropdowns
                BindSelect2("txtResolvedBy", G_ResolvedByList);
                $(`#txtResolvedBy`).val(item.EmployeeMaster_Code).trigger('change');

                BindSelect2("txtReAssign", G_ReAssignList);
                $(`#txtReAssign`).val(item.EmployeeMaster_Code).trigger('change');
                //BindSelect2("txtStatus", G_StatussList);
                //$(`#txtStatus`).val(item.StatusDescription).trigger('change');

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
function Edit(code) {
    $("#txtpage").show();

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
                //response.forEach(item => {
                //    BindSelect2(`txtProjectClient`, G_ProjectList);
                //    $(`#txtProjectClient`).val(item.ClientMaster_Code).select2({ width: '100%' });
                //});
                //response.forEach(item => {
                //    BindSelect2(`txtWorkType`, G_WorkTypeList);
                //    $(`#txtWorkType`).val(item.WorkTypeMaster_Code).select2({ width: '100%' });
                //});
                //response.forEach(item => {
                //    BindSelect2(`txtAssigned`, G_EmployeeNameList);
                //    $(`#txtAssigned`).val(item.EmployeeMaster_Code).select2({ width: '100%' });
                //});
                //response.forEach(item => {
                //    BindSelect2(`txtTaskType`, G_TicketTypetList);
                //    $(`#txtTaskType`).val(item.TicketTypeMaster_Code).select2({ width: '100%' });
                //});
                //response.forEach(item => {
                //    BindSelect2(`txtPriority`, G_PriorityList);
                //    $(`#txtPriority`).val(item.PriorityMaster_Code).select2({ width: '100%' });
                //});
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
