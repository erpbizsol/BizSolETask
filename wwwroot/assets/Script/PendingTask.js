var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
const appBaseURL = sessionStorage.getItem('AppBaseURL');
let IsLoad = true;
let G_StatussList = [];
let G_ResolvedByList = [];
let G_ReAssignList = [];
let fileName;
let AttachmentDetail = [];
let G_Code;
$(document).ready(async function () {
    $("#ERPHeading").text("Pending Task");
    $(".Number").keyup(function (e) {
        if (/\D/g.test(this.value)) this.value = this.value.replace(/[^0-9]/g, '')
    });
    GetStatuss();
    DatePicker();
    if (UserTypes == "A") {
        $("#txtAllUser").show();
    } else {
        $("#txtAllUser").hide();
    }
    $('.select-checkbox-multi').click(function () {
        let inputWidth = $(this).outerWidth();
        $('#dropdownList').css({
            'position': 'absolute',
            'width': inputWidth + 'px',
        }).toggle();
    });
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown-container').length) {
            $('#dropdownList').hide();
        }
    });
    $('#selectAll').on('change', function () {
        $('.option').prop('checked', this.checked);
        updateSelected();
        GetGenerateTaskTicketDateList('Get')
    });
    $(document).on('change', '.option', function () {
        if ($('.option:checked').length === $('.option').length) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
        }
        updateSelected();
    });
    GetEmployeeMasterList('Load');
    GetGenerateTaskTicketDateList('Load');
    $('input[type=radio][name=ticktOrderStatus1]').change(function () {
        GetPendingTaskReport('Get');
    });
    Show();

});
$('input[name="ticktOrderStatus"]').on('change', function () {
    GetGenerateTaskTicketDateList('Get');
});

$("#txtStatus").on('change', function () {
    var Status = $("#txtStatus").val();
    if (Status == "2") {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtResolvedBy1").show();
        $("#txtUpdateBy1").show();
        $("#txtAttachment1").show();
        $("#txtReAssign1").hide();
        GetResolvedBy();
        StatusType();

    } else if (Status == "4") {
        $("#txtTotalResolutionM1").show();
        $("#txtResolutionDate").show();
        $("#txtReAssign1").show();
        $("#txtAttachment1").show();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy1").hide();
        StatusType();
        GetReAssign();

    } else {
        $("#txtTotalResolutionM1").hide();
        $("#txtResolutionDate").hide();
        $("#txtResolvedBy1").hide();
        $("#txtUpdateBy1").hide();
        $("#txtAttachment1").hide();
        $("#txtReAssign1").hide();
    }

});
$(document).on('change', '.option', function () {
    GetGenerateTaskTicketDateList('Get');
});
$(document).on('change', '#ddlReportType', function () {
    var ReportType = $('#ddlReportType').val();

    if (ReportType === 'Default') {
        $("#txtCreatepagereport").hide();
        GetGenerateTaskTicketDateList('Get');
        $("#txtConsolidated").show();
        $("#txtConsolidateda").show();
        $("#txtSummary").show();
    } else {
        GetPendingTaskReport('Get');
        $("#txtCreatepagereport").show();
        $("#txtSummary").hide();
        $("#txtConsolidated").hide();
        $("#txtConsolidateda").hide();
        $("#txtshowDate").hide();
        $("#txtshowDate1").hide();
        $("#table-header").empty();
        $("#table-body").empty();
        

    }
});

$("#txtfromdate1").on('click', function () {
    $("#txtshowDate").show();
    $("#txtshowDate1").show();
});

$("#txtPending").on('click', function () {
    $("#txtshowDate").hide();
    $("#txtshowDate1").hide();
});

$(document).on('change', '#txtToDate, #txtFromDate', function () {
    GetGenerateTaskTicketDateList('Get');
});
function GetGenerateTaskTicketDateList(Type) {
    let Status = $('input[type=radio][name="ticktOrderStatus"]:checked').val();
    let ReportType = $("#ddlReportType").val();
    let TaskNo = $("#txtTaskNo").val();
    TaskNo = TaskNo ? TaskNo.value : 0;

    let fromDate = convertDateFormat($("#txtFromDate").val());
    let toDate = convertDateFormat($("#txtToDate").val());
    if (Status === 'P') {

        fromDate = "";
        toDate = "";
    } else if (Status === 'C') {

        if (!fromDate || !toDate) {
            toastr.error("Please select both From Date and To Date.");
            return;
        }
    }
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : "";
    if (UserTypes === "A") {
        if (Employee_Codes === '') {
            Employee_Codes = "";
        }
    }

    $.ajax({
        url: `${appBaseURL}/api/Master/GetGenerateTaskTicketDatePending?EmployeeName=${Employee_Codes}&Status=${Status}&ticketNo=0&ReportType=${ReportType}&FromDate=${fromDate}&ToDate=${toDate}`,
        type: 'POST',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtSummary").show();
                const StringFilterColumn = ["Assigned", "Description", "Work Type", "Project Client", "TicketNo"];
                const NumericFilterColumn = [];
                const DateFilterColumn = ["Log Date"];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["ACode", "Attachment", "CallTicketMaster_Code", "AttachmentFileName", "ResolutionTime", "Remarks", "ResolvedDate", "RaisedBy", "Module", "Source", "FirstCheckBy", "CommitedDate", "ContactNo", "Status", "EstimatedTime", "UpdateBy", "Priority", "TicketType", "UpdateDate", "ResolvedBy", "FinalCheckBy", "StatusName", "ContactEMail", "ClientMaster_Code", "ModuleMaster_Code", "ResolvedBy_Code", "SourceMaster_Code", "WorkTypeMaster_Code", "EmployeeMaster_Code", "Code"];
                const ColumnAlignment = {};
                const updatedResponse = response.map(item => ({
                    ...item, 'Action':
                        `
                        <a class= "btn btn-success icon-height" title="View Attachment" onclick="ViewAttachment('${item.Code}')" > <i class="fa fa-paperclip"></i></a>
                        <button class="btn btn-primary icon-height mb-1" style="background:#20425d"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn btn-primary icon-height mb-1" style="display:none"  title="StatusType" onclick="StatusType('${item.Code}','${UserMaster_Code}')"><i class="fa-solid fa-pencil"></i></button>
                          <button class="btn btn-success icon-height mb-1" style="background:#216c4a" title="Activity Details" onclick="GetAssingData('${item[`TicketNo`]}')">
                       A D
                        </button>
                        `
                }));
                BizsolCustomFilterGrid.CreateDataTable("table-header", "table-body", updatedResponse, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
            } else {
                $("#txtSummary").hide();
                if (Type != 'Load') {
                    // toastr.error("Record not found...!");
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function ViewAttachment(code) {
    blockUI();
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
                unblockUI();
            } else {
                container.append('<p>No attachments found.</p>');
                toastr.warning("No attachment found.");
                unblockUI();
            }
        },
        error: function () {
            toastr.error("Failed to retrieve attachments.");
            unblockUI();
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
    $("#txtAttachment1").hide();
    $("#txtResolvedBy1").hide();
    $("#txtUpdateBy1").hide();

});
//function DatePicker() {
//    const today = new Date();
//    const defaultDate = formatDateToString(today);

//    $('#txtResolutionDates,#txtToDate,#txtFromDate').val(defaultDate);

//    $('#txtResolutionDates,#txtToDate,#txtFromDate').val(defaultDate);
//    $('#txtResolutionDates,#txtToDate,#txtFromDate').datepicker({
//        format: 'dd/mm/yyyy',
//        autoclose: true,
//        todayHighlight: true
//    });
//}
function DatePicker() {
    const today = new Date();

    // Format today
    const defaultDate = formatDateToString(today);

    // set default values
    $('#txtResolutionDates,#txtToDate').val(defaultDate);

    // ResolutionDate & ToDate -> current date
    $('#txtResolutionDates,#txtToDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('setDate', today);

    // FromDate -> start from 1st of current month
    $('#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1)
    }).datepicker('setDate', new Date(today.getFullYear(), today.getMonth(), 1));
}

function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function GetResolvedBy() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssignedss`,
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
                EmployeeName = response.Code;
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
        url: `${appBaseURL}/api/Master/GetAssignedss`,
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
                EmployeeName = response.Code;
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
function StatusType() {
    var Status = $("#txtStatus").val();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetStatusType?Code=${G_Code}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response) {
                if (Status == "2") {
                    $("#txtTotalResolutionM").val(response[0].Times);
                    $("#txtResolutionDates").val(response[0].Dates);
                    //$("#txtRemarks").val(response[0].Remarks);
                    $("#txtResolvedBy").val(response[0].Code);
                    $("#txtReAssign").val(response[0].Code);
                    response.forEach(item => {
                        BindSelect2(`txtResolvedBy`, G_ResolvedByList);
                        $(`#txtResolvedBy`).val(item.Code).select2({ width: '100%' });
                    });
                }
                else if (Status == "4") {
                    $("#txtTotalResolutionM").val(response[0].Times);
                    $("#txtResolutionDates").val(response[0].Dates);
                    //$("#txtRemarks").val(response[0].Remarks);
                    $("#txtResolvedBy").val(response[0].Code);
                    $("#txtReAssign").val(response[0].Code);
                }

            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("Failed to fetch data. Please try again.");
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
function Edit(code) {
    $("#txtpage").show();
    $("#txtStatus").focus();
    G_Code = code;
    DatePicker();
}
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${day}-${monthAbbreviation}-${year}`;
}
function Save() {
    let Status = $("#txtStatus").val();
    let TotalResolutionM = $("#txtTotalResolutionM").val();
    let ResolutionDates = convertDateFormat($("#txtResolutionDates").val());
    let ReAssign = $("#txtReAssign").val();
    let ResolvedBy = $("#txtResolvedBy").val();
    let UpdateBy = $("#txtUpdateBy").val();
    let Remarks = $("#txtRemarks").val();
    if (Status == "") {
        toastr.error('Please select Status.');
        $("#txtStatus").focus();
        return;
    } else {
        let Postdata =
        {
            pendingTask: [
                {
                    code: parseInt(G_Code),
                    status: parseInt(Status),
                    ResolutionTime: parseInt(TotalResolutionM || 0),
                    resolutiondDate: ResolutionDates,
                    reAssign: ReAssign || 0,
                    resolvedBy: parseInt(ResolvedBy || 0),
                    updateBy: parseInt(UpdateBy || 0),
                    remarks: Remarks,
                    userMaster_Code: parseInt(UserMaster_Code || 0),
                }
            ],
            Attachment: AttachmentDetail
        };
        blockUI();
        $.ajax({
            url: `${appBaseURL}/api/Master/SavePendingTask`,
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
                    SenEmailMassage(response[0].Code);
                    GetGenerateTaskTicketDateList('Get');
                    $("#txtpage").hide();
                    unblockUI();
                }
                else {
                    toastr.error(response[0].Msg);
                    unblockUI();
                }
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
                unblockUI();
            }
        });
    }
}
function ClearData() {
    $("#hftxtCode").val("0");
    $("#txtStatus").val("0").trigger('change');
    $("#txtTotalResolutionM").val("");
    // $("#txtResolutionDates").val("");
    $("#txtRemarks").val("");
    $("#txtReAssign").val("0").trigger('change');
    $("#txtResolvedBy").val("0").trigger('change');
    $("#txtUpdateBy").val('0').trigger('change');
    DatePicker();
}
function GetEmployeeMasterList() {
    $.ajax({
        url: `${appBaseURL}/api/Master/GetAssignedss`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let html = '';
                response.forEach(item => {
                    html += `<label>
                    <input type="checkbox" class="option" value="${item.Code}" data-name="${item.EmployeeName.trim()}"> ${item.EmployeeName.trim()}
                    </label><br>`;
                });
                $('#checkboxOptions').html(html);
                //if (UserTypes == "A") {

                //    $('#checkboxOptions').html(html);
                //} else {
                //    $('#dropdownButton').val(UserName);
                //    $('#dropdownButton').val();

                //}
                if (UserTypes === "A") {
                    $('#checkboxOptions input[type="checkbox"]').prop('disabled', false);
                    GetGenerateTaskTicketDateList('Get');
                } else {
                    $('#dropdownButton').val(UserName).prop('disabled', true);

                    $('#checkboxOptions input[type="checkbox"]').each(function () {
                        if ($(this).data('name') === UserName.trim()) {
                            $(this).prop('checked', true);
                            GetGenerateTaskTicketDateList('Get');
                        } else {
                            $(this).prop('disabled', true);

                        }
                    });


                }

            }
        },
        error: function () {
            alert('Error loading work types');
        }
    });
}
function updateSelected() {
    let selectedNames = $('.option:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#dropdownButton').val(selectedNames);
}
function GetEmpCodes() {
    let selectedCodes = [];
    $('.option:checked').each(function () {
        selectedCodes.push($(this).val());
    });

    return selectedCodes;
}
function GetPendingTaskReport(Type) {
    let Pending = $('input[type=radio][name="ticktOrderStatus1"]:checked').val();

    $.ajax({
        url: `${appBaseURL}/api/Master/GetPendingTaskReport?Code=${UserMaster_Code}&Status=${Pending}`,
        type: 'POST',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtTable").show();
                const StringFilterColumn = ["TicketNo", "Employee Name", "WorkType", "ClientName", "TicketCreatedBy", "Assigned", "assignedBy"];
                const NumericFilterColumn = [""];
                const DateFilterColumn = [""];
                const Button = false;
                const showButtons = [""];
                const StringdoubleFilterColumn = [""];
                const hiddenColumns = ["EmployeeMaster_Code","AssignedBy","WorkByCode", "ReAssign_Code", "TicketAssignedBy", "CreateTicketBy_Code", "Remarks"];
                const ColumnAlignment = {};
                BizsolCustomFilterGrid.CreateDataTable("table-headerC", "table-bodyC", response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
            } else {
                $("#txtTable").hide();
                if (Type != 'Load') {
                   // toastr.error("Record not found...!");
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
function Show() {
    $('input:radio[name=ticktOrderStatus1]').filter(function () {
        this.checked = false;
        GetPendingTaskReport('Get');
    });
    $('input:radio[name=ticktOrderStatus1]').filter(function () {

        if (this.value == $('#hfStatus').val())
            this.checked = true;
        GetPendingTaskReport('Get');
    });

}
function SenEmailMassage(Code) {
    $.ajax({
        url: `${appBaseURL}/api/Email/SenEmailMassage?Code=${Code}&Mode=EDIT`,
        type: 'Get',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response[0].Status === 'Y') {
                //toastr.success(response[0].Msg);

            } else {
                toastr.error("Unexpected response format.");
            }
        },
        error: function (xhr, status, error) {
            toastr.error("Error deleting item:");
        }
    });
}
function GetAssingData(TickatNo) {
    $.ajax({
        url: `${appBaseURL}/api/Master/DateWiseUserWiseTime?TickatNo=${TickatNo}`,
        type: 'GET',
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                const StringFilterColumn = [];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = [];
                const ColumnAlignment = {
                };
                BizsolCustomFilterGrid.CreateDataTable("table-header1", "table-body1", response, Button, showButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, hiddenColumns, ColumnAlignment);
                $('#attachmentModal1').show();
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });

}