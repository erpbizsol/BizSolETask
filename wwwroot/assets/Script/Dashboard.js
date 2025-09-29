var authKeyData = JSON.parse($("#txtAuthKey").val());
var UserName = $("#txtUserName").val();
let UserTypes = authKeyData.UserType;
let UserMaster_Code = authKeyData.UserMaster_Code;
const appBaseURL = $("#txtAppBaseUrl").val();
let employeeChart = null;
let employeeChart1 = null;
let employeeChart2 = null;
let employeeChart3 = null;
let employeeChart4 = null;
let employeeChart5 = null;
let G_selectedCodes = [];
$(document).ready(function () {
    $("#ERPHeading").text("Dashboard");
    $("#txtFromDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtToDate").focus();
        }
    });
    $("#txtToDate").on('keydown', function (e) {
        if (e.key === "Enter") {
            $("#txtShow").focus();
        }
    });
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
        GetEmpCodes();
        
    });
    $(document).on('change', '.option', function () {
        if ($('.option:checked').length === $('.option').length) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
        }
        updateSelected();
        GetEmpCodes();
    });

    DatePicker();
    GetEmployeeType('LOAD');
    loadPieChartFromAPI('LOAD');
    GetClientPending('LOAD');
    GetNormalPriority('LOAD');
    GetHighPriority('LOAD');
    GetEmployeeEfficiency('LOAD');
    GetEMPLOYEEWORKEDHOURS('LOAD');
    GetCLIENTWORKEDHOURS('LOAD');
    GetEmployeeMasterList();
});
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
                if (UserTypes === "A") {
                    $('#checkboxOptions input[type="checkbox"]').prop('disabled', false);
                    GetEmployeeType('GET');
                    loadPieChartFromAPI('GET');
                    GetClientPending('GET');
                    GetNormalPriority('GET');
                    GetHighPriority('GET');
                    GetEmployeeEfficiency('GET');
                    GetEMPLOYEEWORKEDHOURS('GET');
                    GetCLIENTWORKEDHOURS('GET');
                } else {
                    $('#dropdownButton').val(UserName).prop('disabled', true);
                }
            }
        },
    });
}
function GetEmployeeType(Mode) {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEmployeeType?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {

                //// --- Chart Binding Below ---
                const chartLabels = response.map(item => item["Employee Name"] || 'Employee Name');
                const workedHoursData = response.map(item => parseFloat(item["Standard Working Hours"]) || 0);
                const AttendanceHoursData = response.map(item => parseFloat(item["Attendance Hours"]) || 0);
                const RemainingHoursData = response.map(item => parseFloat(item["Timesheet Hours"]) || 0);

                // Chart.js config
                const chartConfig = {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [
                            {
                                label: 'Standard Working Hours',
                                data: workedHoursData,
                                backgroundColor: '#4ba6ef' // dark blue
                            },
                            {
                                label: 'Attendance Hours',
                                data: AttendanceHoursData,
                                backgroundColor: '#009688' // dark blue
                            },
                            {
                                label: 'Timesheet Hours',
                                data: RemainingHoursData,
                                backgroundColor: '#0B4CCA' // dark blue
                            }
                            
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (tooltipItem) {
                                        return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                stacked: false,
                                ticks: {
                                    maxRotation: 50,
                                    minRotation: 50,
                                    autoSkip: false
                                },
                                title: {
                                    display: true,
                                    text: 'Employee',
                                    font: { weight: 'bold', size: 14 }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                suggestedMax: 12,
                                title: {
                                    display: true,
                                    text: 'Working Hours',
                                    font: { weight: 'bold', size: 14 }
                                }
                            }
                        }
                    }
                };

                // Destroy previous chart if exists
                if (employeeChart !== null) {
                    employeeChart.destroy();
                }

                // Draw chart
                const ctx = document.getElementById('employeeChartCanvas').getContext('2d');
                employeeChart = new Chart(ctx, chartConfig);

            } else {
                $("#txtSummary").hide();
                $('#table-bodyEmployeeType').empty();

                if (employeeChart !== null) {
                    employeeChart.destroy();
                    employeeChart = null;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyEmployeeType').empty();
        }
    });
}
function loadPieChartFromAPI(Mode) {
    const FDate = $('#txtFromDate').val();
    const TDate = $('#txtToDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEmployeePending?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {

                const ctx1 = document.getElementById('myPieChart').getContext('2d');
                const chartLabels = response.map(item => item["TicketAgeBucket"] || 'Unknown');
                const chartData = response.map(item => item["Pending"] || 0);

                const pieColors = [
                    "#1E90FF",  // Older Bucket
                    "#00008B",  // 7Day Bucket
                    "#FF7F50",  // 30Day Bucket
                    "#800080"   // 15Day Bucket
                ];

                // Destroy previous chart
                if (employeeChart1 !== null) {
                    employeeChart1.destroy();
                }

                employeeChart1 = new Chart(ctx1, {
                    type: 'pie',
                    labels: ['Active'],
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartData,
                            backgroundColor: pieColors.slice(0, chartData.length),
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "right"
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const total = context.chart._metasets[context.datasetIndex].total;
                                        const value = context.raw;
                                        const percentage = ((value / total) * 100).toFixed(2);
                                        return `${value} (${percentage}%)`;
                                    }
                                }
                            },
                            datalabels: {
                                formatter: (value, context) => {
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${value} (${percentage}%)`;
                                },
                                color: '#000',
                                font: {
                                    weight: 'bold',
                                    size: 12
                                }

                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            } else {
                if (employeeChart1 !== null) {
                    employeeChart1.destroy();
                    employeeChart1 = null;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching data:", error);
        }
    });
}
function GetClientPending(Mode) {
    const FDate = $('#txtFromDate').val();
    const TDate = $('#txtToDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;
    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetClientPending?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {
                let totalTickets = response.reduce((sum, item) => sum + (parseInt(item['TicketCount']) || 0), 0);
                $("#TotalTickets").text(totalTickets);
                const ctx2 = document.getElementById('myDountChart').getContext('2d');
                const chartLabels1 = response.map(item => item["Client Name"] || 'Unknown');
                const chartData1 = response.map(item => item["Overdue"] || 0);

                const pieColors = [
                    '#0DA9B7', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#66ff66', '#ff66cc',
                    '#00BFFF', '#FFD700', '#DC143C', '#8A2BE2'
                ];

                const tooltipData3 = response.map(item => ({
                    name: item["Overdue"]
                }));

                // Destroy previous chart
                if (employeeChart2 !== null) {
                    employeeChart2.destroy();
                }

                employeeChart2 = new Chart(ctx2, {
                    type: 'doughnut', // <<< changed here
                    data: {
                        labels: chartLabels1,
                        datasets: [{
                            data: chartData1,
                            backgroundColor: pieColors.slice(0, chartData1.length),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        cutout: '50%', // doughnut thickness
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    color: '#000',
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (tooltipItem) {
                                        const index = tooltipItem.dataIndex;
                                        const label = chartLabels1[index];
                                        return `${label}`;
                                    },
                                    title: function (tooltipItems) {
                                        const index = tooltipItems[0].dataIndex;
                                        return `Overdue : ${tooltipData3[index].name}`;
                                    }
                                }
                            },
                            datalabels: {
                                formatter: (value, context) => {
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${percentage}%`;
                                },
                                color: '#fff',
                                font: {
                                    weight: 'bold',
                                    size: 12
                                }
                            }
                        }
                    },
                    //plugins: [ChartDataLabels]
                });
            } else {
                if (employeeChart2 !== null) {
                    employeeChart2.destroy();
                    employeeChart2 = null;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching data:", error);
        }
    });
}
function GetNormalPriority(Mode) {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetNormalPriority?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtNormalPriority").text(response[0].UID)
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyEmployeeType').empty();
        }
    });
}
function GetHighPriority(Mode) {
    const FDate = $('#txtFromDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const TDate = $('#txtToDate').val();
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetHighPriority?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response.length > 0) {
                $("#txtHighPriority").text(response[0].UID)
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            $('#table-bodyEmployeeType').empty();
        }
    });
}
function GetEmployeeEfficiency(Mode) {
    const FDate = $('#txtFromDate').val();
    const TDate = $('#txtToDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEmployeeEfficiency?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {

                const ctx = document.getElementById('employeeEfficiency').getContext('2d');
                const chartLabels = response.map(item => item["EmployeeName"] || 'Unknown');
                const chartData = response.map(item => item["EfficiencyPercent"] || 0);

                const pieColors = [
                    "#1E90FF",  // Older Bucket
                    "#00008B",  // 7Day Bucket
                    "#FF7F50",  // 30Day Bucket
                    "#800080"   // 15Day Bucket
                ];
                if (employeeChart3 !== null) {
                    employeeChart3.destroy();
                }

                employeeChart3 = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Employee Performance (%)',
                            data: chartData,
                            backgroundColor: '#2196f3'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                //text: 'Employee Efficiency Record',
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            },
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Employee Name'

                                },
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                },
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 90,
                                    autoSkip: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'Employee Performance (%)'
                                },
                                 font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            }
                        }
                    }
                });
            } else {
                if (employeeChart3 !== null) {
                    employeeChart3.destroy();
                    employeeChart3 = null;
                }
            }
        }
    });
}
function GetEMPLOYEEWORKEDHOURS(Mode) {
    const FDate = $('#txtFromDate').val();
    const TDate = $('#txtToDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetEMPLOYEEWORKEDHOURS?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {

                const ctx = document.getElementById('EWorkedHours').getContext('2d');
                const chartLabels = response.map(item => item["EmployeeName"] || 'Unknown');
                const chartData = response.map(item => item["workingHours"] || 0);

                const pieColors = [
                    "#1E90FF",  // Older Bucket
                    "#00008B",  // 7Day Bucket
                    "#FF7F50",  // 30Day Bucket
                    "#800080"   // 15Day Bucket
                ];
                if (employeeChart4 !== null) {
                    employeeChart4.destroy();
                }

                employeeChart4 = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'WorkedHours',
                            data: chartData,
                            backgroundColor: '#2196f3'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                //text: 'Employee Efficiency Record',
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            },
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Employee Name'

                                },
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                },
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 90,
                                    autoSkip: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'working Hours'
                                },
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            }
                        }
                    }
                });
            } else {
                if (employeeChart4 !== null) {
                    employeeChart4.destroy();
                    employeeChart4 = null;
                }
            }
        }
    });
}
function GetCLIENTWORKEDHOURS(Mode) {
    const FDate = $('#txtFromDate').val();
    const TDate = $('#txtToDate').val();
    const FromDate = convertToYearMonthDay(FDate);
    const ToDate = convertToYearMonthDay(TDate);
    let EmployeeName = GetEmpCodes();
    let Employee_Codes = EmployeeName.length > 0 ? EmployeeName.join(',') : null;

    $.ajax({
        url: `${appBaseURL}/api/Dashboard/GetCLIENTWORKEDHOURS?Mode=${Mode}&FromDate=${FromDate}&ToDate=${ToDate}&UserMaster_Code=${UserMaster_Code}&EmployeeMaster_Code=${Employee_Codes}`,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Auth-Key', authKeyData);
        },
        success: function (response) {
            if (response && response.length > 0) {

                const ctx = document.getElementById('CWorkedHours').getContext('2d');
                const chartLabels = response.map(item => item["ClientName"] || 'Client Name');
                const chartData = response.map(item => item["workingHours"] || 0);

                const pieColors = [
                    "#1E90FF",  // Older Bucket
                    "#00008B",  // 7Day Bucket
                    "#FF7F50",  // 30Day Bucket
                    "#800080"   // 15Day Bucket
                ];
                if (employeeChart5 !== null) {
                    employeeChart5.destroy();
                }

                employeeChart5 = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'ClientName',
                            data: chartData,
                            backgroundColor: '#2196f3'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                //text: 'Employee Efficiency Record',
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            },
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Client Name'

                                },
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                },
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 90,
                                    autoSkip: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: 'working Hours'
                                },
                                font: {
                                    size: 16,
                                    weight: 'bold',
                                }
                            }
                        }
                    }
                });
            } else {
                if (employeeChart5 !== null) {
                    employeeChart5.destroy();
                    employeeChart5 = null;
                }
            }
        }
    });
}
function DatePicker() {
    const today = new Date();
    const defaultDate = formatDateToString(today);
    $('#txtToDate,#txtFromDate').val(defaultDate);
    $('#txtToDate,#txtFromDate').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true,
        todayHighlight: true
    }).datepicker('update', defaultDate);
    //setStartOfMonth();
}
function formatDateToString(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
function setupDateInputFormatting() {
    $('#txtFromDate,#txtToDate').on('input', function () {
        let value = $(this).val().replace(/[^\d]/g, '');

        if (value.length >= 2 && value.length < 4) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        } else if (value.length >= 4) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
        }
        $(this).val(value);

        if (value.length === 10) {
            validateDate(value);
        }
    });
}
function validateDate(value) {
    let regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    let isValidFormat = regex.test(value);

    if (isValidFormat) {
        let parts = value.split('/');
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);

        let date = new Date(year, month - 1, day);

        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            $('#txtFromDate,#txtToDate').val('');
        }
    } else {
        $('#txtFromDate,#txtToDate').val('');
    }
}
function convertToYearMonthDay(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
function updateSelected() {
    let selectedNames = $('.option:checked').map(function () {
        return $(this).data('name');
    }).get().join(', ');
    $('#dropdownButton').val(selectedNames);
}
function GetEmpCodes() {
    G_selectedCodes = [];
    $('.option:checked').each(function () {
        G_selectedCodes.push($(this).val());
    });

    return G_selectedCodes;
}

$('#txtFromDate, #txtToDate').on('change', function () {
    GetEmployeeType('GET');
    loadPieChartFromAPI('GET');
    GetClientPending('GET');
    GetNormalPriority('GET');
    GetHighPriority('GET');
    GetEmployeeEfficiency('GET');
    GetEMPLOYEEWORKEDHOURS('GET');
    GetCLIENTWORKEDHOURS('GET');
});

$(document).on('change', '#checkboxOptions,#selectAll', function () {
    //if ($('.option:checked').length === $('.option').length) {
    //    $('#selectAll').prop('checked', true);
    //    GetEmployeeType('GET');
    //    loadPieChartFromAPI('GET');
    //    GetClientPending('GET');
    //} else {
    //    $('#selectAll').prop('checked', false);
    //    GetEmployeeType('GET');
    //    loadPieChartFromAPI('GET');
    //    GetClientPending('GET');
    //}
    GetEmployeeType('GET');
    loadPieChartFromAPI('GET');
    GetClientPending('GET');
});

function Reset() {
    DatePicker();
    $('#dropdownButton').val(null).trigger('change');
    G_selectedCodes = [];
    $(".option").prop("checked", false);
}

   