var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
let G_Code = 0;
let G_EmployeeCode = 0;
const appBaseURL = sessionStorage.getItem('AppBaseURL');

$(document).ready(function () {
    $("#ERPHeading").text("Tickets Rating");
    TicketsRatingPending('Load');
    DatePicker();
  
});

$(document).on("blur", ".txtRemark", function () {
    let id = this.id;
    let val = $(this).val();
    let empCode = id.split("_")[1];
    Ratingfunction(empCode);
});
$(document).on('change', '#txtFromDate,#txtToDate', function () {
    TicketsRatingPending('Get');
});
$(document).on('change', '#txtReportType', function () {
    let reportType = $("#txtReportType").val();

    if (reportType === "H") {
        $("#txtshowFromDate").show();
        $("#txtshowToDate").show();
    } else {
        $("#txtshowFromDate").hide();
        $("#txtshowToDate").hide();
    }
    TicketsRatingPending('Get');
});
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);
    $('#txtFromDate,#txtToDate').val(defaultDate);
    $('#txtFromDate, #txtToDate').datepicker({
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
    $('#txtFromDate, #txtToDate').on('changeDate', function () {
        let fromDate = $('#txtFromDate').datepicker('getDate');
        let toDate = $('#txtToDate').datepicker('getDate');

        if (fromDate && toDate) {
            // chhoti ko start aur badi ko end maan lo
            let startDate = fromDate < toDate ? fromDate : toDate;
            let endDate = fromDate < toDate ? toDate : fromDate;

            // months difference nikalna
            let diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12
                + (endDate.getMonth() - startDate.getMonth());

            // agar din bhi compare karna ho to
            if (endDate.getDate() < startDate.getDate()) {
                diffMonths--; // ek month kam kar dena
            }

            if (diffMonths >= 3) {
                alert("Only 3 months is allowed.");
                $('#txtFromDate').val('');
                $('#txtToDate').val('');
            }
        }
    });

    //$('#txtFromDate, #txtToDate').on('changeDate', function () {
    //    let fromDate = $('#txtFromDate').datepicker('getDate');
    //    let toDate = $('#txtToDate').datepicker('getDate');

    //    if (fromDate && toDate) {
    //        let diffTime = Math.abs(toDate - fromDate);
    //        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    //        if (diffDays > 92) { // approx 3 months
    //            alert("Only 3 months is allowed.");
    //           // $('#txtFromDate').val(''); // reset From Date
    //        }
    //    }
    //});
  
}
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbreviation = monthNames[parseInt(month) - 1];
    return `${day}-${monthAbbreviation}-${year}`;
}
function TicketsRatingPending(Type) {
    let reportType = $("#txtReportType").val();
    let FromDate = "";
    let ToDate = "";
    if (reportType === "L") {
        FromDate = convertDateFormat($("#txtFromDate").val());
        ToDate = convertDateFormat($("#txtToDate").val());
    }
    if (reportType === "H") {
        FromDate = convertDateFormat($("#txtFromDate").val());
        ToDate = convertDateFormat($("#txtToDate").val());
    }
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketsRatingPending?ReportType=${reportType}&FromDate=${FromDate}&ToDate=${ToDate}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtTable").show();
                const StringFilterColumn = ["Ticket No","Created by","Log Date","Close By","Client Name", "Work Type", "Rating Status"];
                const NumericFilterColumn = [];
                const DateFilterColumn = [];
                const Button = false;
                const showButtons = [];
                const StringdoubleFilterColumn = [];
                const hiddenColumns = ["Code", "Description", "LogDate","CallTicketMaster_Code"];
                const ColumnAlignment = {
                    "CreatedOn": 'center'
                };
                const updatedResponse = response.map(item => ({
                    ...item, 'Action': `
                <button class="btn btn-primary icon-height mb-1"  title="Edit" onclick="Edit('${item.Code}')"><i class="fa-solid fa-pencil"></i></button>`
                }));
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
function openSavePopup() {
    var saveModal = new bootstrap.Modal(document.getElementById("staticBackdrop"));
    saveModal.show();
}
function CloseModal() {
    var modal = bootstrap.Modal.getInstance(document.getElementById('staticBackdrop'));
    if (modal) {
        modal.hide();
    }

}

const stars = document.querySelectorAll("#starRating span");

const hiddenInput = document.getElementById("ddlStar");

stars.forEach(star => {
    star.addEventListener("click", function () {
        let rating = parseInt(this.getAttribute("data-value"));
        let currentRating = parseInt(hiddenInput.value) || 0;

        // 👉 अगर वही star पर क्लिक किया और वो already selected है → एक step पीछे जाओ
        if (rating === currentRating) {
            rating = rating - 1;
        }

        hiddenInput.value = rating;

        // Reset all stars
        stars.forEach(s => s.classList.remove("active"));
        // Highlight selected stars
        for (let i = 0; i < rating; i++) {
            stars[i].classList.add("active");
        }
    });
});
$(document).on("click", "#starRating span", function () {
    let value = $(this).data("value");
    $("#ddlStar").val(value);

    $("#starRating span").removeClass("selected");
    $("#starRating span").each(function () {
        if ($(this).data("value") <= value) {
            $(this).addClass("selected");
        }
    });
});
function Edit(code) {
    openSavePopup();
    G_Code = code;
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketsRatingByCode?CallTicketMaster_Code=${G_Code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            let container = $("#employeeRatingsContainer");
            container.empty();

            if (response && response.length > 0) {
                response.forEach((item, index) => {
                    let starValue = item.Star || 0;
                    let remarkVal = item.RatingRemark || "";

                    let block = `
                        <div class="row mb-3 employee-block" 
                             data-index="${item.EmployeeMaster_Code}" 
                             data-empcode="${item.EmployeeMaster_Code}">
                            <div class="col-md-12">
                                
                                <div class="row">
                                <div class="col-md-2">
                                    <label><b>${item.EmployeeName}</b></label>
                                </div>
                                    <div class="col-md-5">
                                        <label>Star Rating <span style="color:red">*</span></label>
                                        <div class="stars" id="starRating_${item.EmployeeMaster_Code}">
                                            <span data-value="1">★</span>
                                            <span data-value="2">★</span>
                                            <span data-value="3">★</span>
                                            <span data-value="4">★</span>
                                            <span data-value="5">★</span>
                                        </div>
                                        <input type="hidden" class="ddlStar" id="ddlStar_${item.EmployeeMaster_Code}" value="${starValue}" />
                                    </div>
                                    <div class="col-md-5">
                                        <label>Remark<span style="color:red">*</span></label>
                                        <textarea rows="3" class="form-control form-control-sm box_border txtRemark" 
                                         id="txtRemark_${item.EmployeeMaster_Code}" placeholder="Enter remark...">${remarkVal}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(block);

                    // highlight stars initially
                    highlightStars(`#starRating_${item.EmployeeMaster_Code}`, starValue);

                    // click event
                    $(`#starRating_${item.EmployeeMaster_Code} span`).on("click", function () {
                        let val = $(this).data("value");
                        highlightStars(`#starRating_${item.EmployeeMaster_Code}`, val);
                        $(`#starRating_${item.EmployeeMaster_Code}`).siblings(".ddlStar").val(val);
                        var Id = $(this).parent().attr("id");
                        let arr = Id.split("_");
                        var EmployeeMaster_Code = arr[1];
                        Ratingfunction(EmployeeMaster_Code)
                    });
                });
            } else {
                container.html("<p>No records found</p>");
            }
        }
    });
}
function highlightStars(containerId, val) {
    $(`${containerId} span`).each(function () {
        if ($(this).data("value") <= val) {
            $(this).addClass("selected").css("color", "gold"); // active
        } else {
            $(this).removeClass("selected").css("color", "#ccc"); // inactive
        }
    });
}
function Ratingfunction(EmployeeMaster_Code) { 
    var star = $("#ddlStar_" + EmployeeMaster_Code).val();
    var Remark = $("#txtRemark_" + EmployeeMaster_Code).val();
    let payload = {
            CallTicketMaster_Code: G_Code,
            EmployeeCode: EmployeeMaster_Code,
            Star: parseInt(star),
            Remark: Remark,
            UserMaster_Code: UserMaster_Code
    };
    $.ajax({
        url: `${appBaseURL}/api/Master/SaveTicketsRating`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Auth-Key", authKeyData);
        },
        success: function (response) {
            if (response[0].Status === "Y") {
                toastr.success(response[0].Msg);
                CloseModal();
                TicketsRatingPending('Get');
            } else {
                toastr.error(response[0].Msg);
            }
        },
        error: function (xhr) {
            console.error("Error:", xhr.responseText);
            toastr.error("An error occurred while saving the data.");
        }
    });
}

