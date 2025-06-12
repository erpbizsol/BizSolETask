var authKeyData1 = sessionStorage.getItem('authKey');
var jsonObject = JSON.parse(authKeyData);
let UserMaster_Code1 = jsonObject.UserMaster_Code;
const appBaseURL1 = sessionStorage.getItem('AppBaseURL');


function GetWorksTime() {
    $.ajax({
        url: `${appBaseURL1}/api/Master/GetWorksTimes?Code=${UserMaster_Code1}`,
        type: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData1);
        },
        success: function (response) {
            $('#gettime').text(response[0].Time); 
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            alert("Server connection error. Please check if the API is running.");
        }
    });
}

window.GetWorksTime = GetWorksTime;