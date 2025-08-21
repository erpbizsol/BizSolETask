$(document).ready(function () {
    UserMenuRightsList();
    TicketsRating();
    GetWorksTime();
});
var authKeyData1 = JSON.parse(sessionStorage.getItem('authKey'));
var authKeyData = sessionStorage.getItem('authKey');
const UserType = authKeyData1.UserType;
var baseUrl1 = sessionStorage.getItem('AppBaseURL');
var baseUrl = sessionStorage.getItem('AppBaseURLMenu');
let UserMasterCode = authKeyData1.UserMaster_Code;
function UserMenuRightsList() {
        $.ajax({
            url: `${baseUrl1}/api/Master/GetUserModuleMasterList?UserType=${UserType}`,
            type: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Auth-Key', authKeyData);
            },
            success: function (value) {
                if (value.length > 0) {
                    sessionStorage.setItem('UserModuleMaster', JSON.stringify(value));
                    var menuHtml = '';
                    $.each(value, function (index, item) {
                       
                            menuHtml += '<li>';
                            menuHtml += '<a href=' + baseUrl + '/' + item.URL + '><span class="iconBg"><i class="' + item.Icon + '"></i></span>';
                            menuHtml += '<span>' + item.MenuName + '</span></a>';
                            menuHtml += '</a>';
                            menuHtml += '</li>';
                    });

                    $('#side-menu').html(menuHtml);

                    feather.replace();
                    setActiveMenu();
                }
            }
        });
}
function setActiveMenu() {
    var currentUrl = window.location.pathname;

    $('#side-menu ul').hide();

    $('#side-menu li').removeClass('mm-active last-active');
    $('#side-menu a').removeClass('active');

    $('#side-menu a').each(function () {
        var menuLink = $(this).attr('href');
        if (menuLink && (currentUrl === new URL(menuLink, window.location.origin).pathname) && currentUrl !== "/") {
            $(this).addClass('active');
            $(this).parents('li').last().addClass('last-active');
            $(this).parents('ul.sub-menu').show();
        }
    });
}
function GetWorksTime() {
    $.ajax({
        url: `${baseUrl1}/api/Master/GetWorksTimes?Code=${UserMasterCode}`,
        type: 'POST',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData); 
        },
        success: function (response) {
            if (Array.isArray(response) && response.length > 0 && response[0].Time != null) {
                $('#gettime').text(response[0].Time); 
            } else {
                $('#gettime').text('0');
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            alert("Server connection error. Please check if the API is running.");
        }
    });
}
function TicketsRating() {
    $.ajax({
        url: ` ${baseUrl1}/api/Master/TICKETSRATING?UserMaster_Code=${UserMasterCode}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                let STotal = response[0].Total;
                $("#txtTickets").text("Tickets Rating(" +STotal+")");

            }
        }
    });
}
