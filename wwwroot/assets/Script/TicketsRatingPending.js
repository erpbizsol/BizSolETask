var authKeyData = JSON.parse(sessionStorage.getItem('authKey'));
var UserName = sessionStorage.getItem('UserName');
let UserMaster_Code = authKeyData.UserMaster_Code;
let UserTypes = authKeyData.UserType;
let G_Code = 0;
const appBaseURL = sessionStorage.getItem('AppBaseURL');

$(document).ready(function () {
    $("#ERPHeading").text("Tickets Rating");
    TicketsRatingPending('Load');
});
$(document).on('change', '#txtReportType', function () {
    TicketsRatingPending('Get');
});
function TicketsRatingPending(Type) {
    reportType = $("#txtReportType").val();
    $.ajax({
        url: `${appBaseURL}/api/Master/GetTicketsRatingPending?ReportType=${reportType}`,
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
                const hiddenColumns = ["Code", "Description"];
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
                    toastr.error("Record not found...!");
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
        url: ` ${appBaseURL}/api/Master/GetTicketsRatingByCode?CallTicketMaster_Code=${G_Code}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {
                let starValue = response[0].Star;
                let remarkVal = response[0].Remark;

                // hidden input set
                $("#ddlStar").val(starValue);

                // remark set
                $("#txtRemark").val(remarkVal);

                // stars highlight
                $("#starRating span").removeClass("selected");
                $("#starRating span").each(function () {
                    if ($(this).data("value") <= starValue) {
                        $(this).addClass("selected");
                    }
                });
            } else {
                $("#ddlStar").val("");
                $("#txtRemark").val("");
                $("#starRating span").removeClass("selected");
            }
        }
    });
}
function Ratingfunction() {
    var Star = $("#ddlStar").val();
    var Remark = $("#txtRemark").val();
    if (Star == "") {
        toastr.error('Please select  Star.');
        $("#ddlStar").focus();
        return;
    } else if (Remark == "") {
        toastr.error('Please enter Remark.');
        $("#txtRemark").focus();
        return;
    } else {
        $.ajax({
            url: `${appBaseURL}/api/Master/SaveTicketsRating?CallTicketMaster_Code=${G_Code}&Star=${Star}&Remark=${Remark}&UserMaster_Code=${UserMaster_Code}`,
            type: "GET",
            contentType: "application/json",
            dataType: "json",
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
            error: function (xhr, status, error) {
                console.error("Error:", xhr.responseText);
                toastr.error("An error occurred while saving the data.");
            },
        });
    }
}
