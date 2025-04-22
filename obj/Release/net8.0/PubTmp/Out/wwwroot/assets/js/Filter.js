﻿
const BizsolCustomFilterGrid = {
    CreateDataTable: function CreateDataTable(headerId, bodyId, data, Button, ShowButtons, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn, HiddenColumns, ColumnAlignment, Paginator = true) {
        const columns = Object.keys(data[0]);
        const tableId = $('#' + bodyId).closest('table').attr('id');
        renderTableHeader(HiddenColumns, headerId, bodyId, columns, Button, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn);
        window[`hiddenColumns_${bodyId}`] = HiddenColumns;
        window[`columnAlignment_${bodyId}`] = ColumnAlignment;
        renderTable(data, bodyId);
        window[`button_${tableId}`] = Button;
        window[`ShowButtons_${bodyId}`] = ShowButtons;
        window[`filteredData_${tableId}`] = data;
        window[`filteredDataTemp_${tableId}`] = data;
        bodyId = bodyId;
        window[`currentPage_${tableId}`] = 1;
        window[`itemsPerPage_${tableId}`] = 10;
        window[`Paginator_${tableId}`] = Paginator;
        if (Paginator) {
            createPaginator(tableId, bodyId);
            renderTableWithPagination(tableId, bodyId);
        }
    }

}

window.BizsolCustomFilterGrid = BizsolCustomFilterGrid;
window.populateFilterOptions = function populateFilterOptions(columnName, bodyId) {

    var uniqueValues = new Set();

    const tableId = $('#' + bodyId).closest('table').attr('id');
    window[`filteredData_${tableId}`].forEach(function (row) {
        if (row.hasOwnProperty(columnName)) {
            uniqueValues.add(row[columnName]);
        }
    });

    var checkboxContainer = $('#checkbox-container-' + columnName.replace(/\s+/g, ''));
    checkboxContainer.empty();
    checkboxContainer.append('<label><input type="checkbox" class="filter-checkbox" value="All"> All</label>');

    uniqueValues.forEach(function (value) {
        checkboxContainer.append('<label><input type="checkbox" class="filter-checkbox" value="' + value + '"> ' + value + '</label>');
    });

    checkboxContainer.find('input[value="All"]').change(function () {
        var isChecked = $(this).is(':checked');
        checkboxContainer.find('input[type="checkbox"]').not(this).prop('checked', isChecked);
    });

    checkboxContainer.find('input[type="checkbox"]').not('input[value="All"]').change(function () {
        var allChecked = checkboxContainer.find('input[type="checkbox"]').not('input[value="All"]').length ===
            checkboxContainer.find('input[type="checkbox"]:checked').not('input[value="All"]').length;

        checkboxContainer.find('input[value="All"]').prop('checked', allChecked);
    });
}
window.toggleFilter = function (columnName, bodyId) {
    closeAllFilters();
    closeAllFiltersDouble();
    populateFilterOptions(columnName, bodyId);
    $('#filter-' + columnName.replace(/\s+/g, '')).toggle();
    $('#filterDropdown-' + columnName.replace(/\s+/g, '')).toggle();
};
window.closeAllFilters = function closeAllFilters() {
    $('.filter-dropdown').hide();
    $('.filter-input').val('');
    $('.filter-dropdown-double').hide();
    $('.checkbox-container-double').hide();
}

$(document).on('input', '.filter-input', function () {
    var searchValue = $(this).val().toLowerCase();
    var column = $(this).data('column');
    $('#checkbox-container-' + column + ' label').each(function () {
        var checkboxLabel = $(this).text().toLowerCase();
        $(this).toggle(checkboxLabel.includes(searchValue));
    });
});

$(document).click(function (event) {
    if (!$(event.target).closest('.filter-dropdown,.table-filter-arrow, .fafilter').length) {
        $('.filter-division').hide();
        closeAllFilters();
    }
});

$(document).click(function (event) {
    if (!$(event.target).closest('.filter-dropdown, .fafilter').length) {
        closeAllFilters();
    }
});

$('.filter-dropdown').click(function (event) {
    event.stopPropagation();
});
window.checkAllCheckboxesOnLoad = function checkAllCheckboxesOnLoad() {
    $('.filter-checkbox').prop('checked', true);
}

checkAllCheckboxesOnLoad();
window.toggleFilterDouble = function (columnName) {
    closeAllFiltersDouble();
    $('#filter-double-' + columnName.replace(/\s+/g, '')).toggle();
    $('.filter-dropdown').hide();
    $('#filterDropdown-' + columnName.replace(/\s+/g, '')).toggle();
};

$(document).click(function (event) {
    if (!$(event.target).closest('.filter-dropdown-double, .fafilter').length) {
        closeAllFiltersDouble();
    }
});

var columnFilters = {};
window.populateDateFilter = function (columnName, bodyId) {
    closeAllFilters();
    closeAllFiltersDouble();
    $('#filter-' + columnName.replace(/\s+/g, '')).toggle();
    $('#filterDropdown-' + columnName.replace(/\s+/g, '')).toggle();
    var uniqueDates = new Set();
    const tableId = $('#' + bodyId).closest('table').attr('id');
    window[`filteredData_${tableId}`].forEach(function (row) {
        if (row.hasOwnProperty(columnName)) {
            uniqueDates.add(row[columnName]);
        }
    });
    var dateStructure = {};
    uniqueDates.forEach(function (dateStr) {
        var dateObj = new Date(dateStr);
        var year = dateObj.getFullYear();
        var month = dateObj.toLocaleString('default', { month: 'long' });
        var day = dateObj.getDate();

        if (!dateStructure[year]) {
            dateStructure[year] = {};
        }
        if (!dateStructure[year][month]) {
            dateStructure[year][month] = [];
        }
        dateStructure[year][month].push(day);
    });
    var checkboxContainer1 = $('#checkbox-container-' + columnName.replace(/\s+/g, ''));
    checkboxContainer1.empty();
    checkboxContainer1.append('<label><input type="checkbox" class="filter-checkbox" value="All"> (Select All)</label>');
    for (var year in dateStructure) {
        checkboxContainer1.append(
            `<label><i class="fa-solid fa-plus toggle-icon" data-target="year-${columnName.replace(/\s+/g, '')}-${year}"></i><input type="checkbox" class="year-checkbox" value="${year}"> ${year}</label>` +
            `<div class="nested-checkbox" id="year-${columnName.replace(/\s+/g, '')}-${year}"></div>`
        );
    }
    for (var year in dateStructure) {
        for (var month in dateStructure[year]) {
            var monthCheckbox = `<label><i class="fa-solid fa-plus toggle-icon" data-target="month-${columnName.replace(/\s+/g, '')}-${year}-${month}"></i><input type="checkbox" class="month-checkbox" value="${month}"> ${month}</label>`;
            var dayCheckboxes = `<div class="nested-checkbox" id="month-${columnName.replace(/\s+/g, '')}-${year}-${month}">`;
            dateStructure[year][month].forEach(function (day) {
                dayCheckboxes += `<label><input type="checkbox" class="day-checkbox" value="${day}"> ${day}</label>`;
            });
            dayCheckboxes += '</div>';

            $('#year-' + columnName.replace(/\s+/g, '') + '-' + year).append(monthCheckbox + dayCheckboxes);
        }
    }
    checkboxContainer1.find('.year-checkbox').change(function () {
        var isChecked = $(this).is(':checked');
        var year = $(this).val();
        $('#year-' + columnName.replace(/\s+/g, '') + '-' + year + ' input[type="checkbox"]').prop('checked', isChecked);
    });
    checkboxContainer1.find('.month-checkbox').change(function () {
        var isChecked = $(this).is(':checked');
        var monthCheckboxes = $(this).closest('label').nextAll('.nested-checkbox:first');
        monthCheckboxes.find('input[type="checkbox"]').prop('checked', isChecked);

        var yearCheckbox = $(this).closest('.nested-checkbox').prev('label').find('.year-checkbox');
        var monthCheckboxes = $(this).closest('.nested-checkbox').find('.month-checkbox');

        var checkedCount = monthCheckboxes.filter(':checked').length;
        yearCheckbox.prop('checked', checkedCount > 0);
    });
    checkboxContainer1.find('.day-checkbox').change(function () {
        var monthCheckbox = $(this).closest('.nested-checkbox').prev('label').find('.month-checkbox');
        var allDaysChecked = $(this).closest('.nested-checkbox').find('.day-checkbox:checked').length > 0;
        monthCheckbox.prop('checked', allDaysChecked);

        var yearCheckbox = monthCheckbox.closest('.nested-checkbox').prev('label').find('.year-checkbox');
        var allMonthsChecked = $(this).closest('.nested-checkbox').prevAll('label').find('.month-checkbox:checked').length;
        var allMonthsChecked1 = $(this).closest('.nested-checkbox').nextAll('label').find('.month-checkbox:checked').length;
        yearCheckbox.prop('checked', allMonthsChecked > 0 || allMonthsChecked1 > 0);
    });
    checkboxContainer1.find('input[value="All"]').change(function () {
        var isChecked = $(this).is(':checked');
        checkboxContainer1.find('input[type="checkbox"]').not(this).prop('checked', isChecked);
    });
    checkboxContainer1.find('input[type="checkbox"]').not('input[value="All"]').change(function () {
        var allChecked = checkboxContainer1.find('input[type="checkbox"]').not('input[value="All"]').length ===
            checkboxContainer1.find('input[type="checkbox"]:checked').not('input[value="All"]').length;
        checkboxContainer1.find('input[value="All"]').prop('checked', allChecked);
    });
    $('.toggle-icon').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        var targetId = $(this).data('target');
        $('#' + targetId).toggle();
        $(this).toggleClass('fa-plus fa-minus');
    });
}
window.applyFilters = function applyFilters(bodyId) {
    var column1 = "";
    var column1 = "";
    const tableId = $('#' + bodyId).closest('table').attr('id');

    var filteredArray = window[`filteredData_${tableId}`].filter(item => {
        return Object.keys(columnFilters).every(column => {
            column1 = column;
            var selectedValues = columnFilters[column];
            var cellValue = item[column];

            if (selectedValues.includes("All")) {
                return true;
            }

            var dateObj = new Date(cellValue);
            console.log(dateObj);

            if (!isNaN(dateObj.getTime())) {
                var year = dateObj.getFullYear().toString();
                var month = dateObj.toLocaleString("default", { month: "long" });
                var day = dateObj.getDate().toString();
                return (
                    selectedValues.includes(year) &&
                    selectedValues.includes(month) &&
                    selectedValues.includes(day)
                );
            }

            return selectedValues.includes(cellValue);
        });
    });
    window[`filteredData_${tableId}`] = filteredArray;
    renderTable(filteredArray, bodyId);
    if (window[`Paginator_${tableId}`]) {
        createPaginator(tableId, bodyId);
        renderTableWithPagination(tableId, bodyId);
    }
    const th = $('#filterDropdown-' + column1.replace(/\s+/g, '')).closest('th');
    const span = th.find('span.filter-table-heading');
    span.find('.fa-filter').remove();
    span.append('<i class="fa-solid fa-filter" style="color: #072d66; margin-left: 5px;"></i>');

}
window.toggleFilterNumeric = function (filterId, ColumnName) {
    closeAllFilters();
    closeAllFiltersDouble();
    $('#filterDropdown-' + ColumnName.replace(/\s+/g, '')).toggle();
    $('#' + filterId).toggle();
    toggleNumericInputs(ColumnName);
};
window.toggleNumericInputs = function (columnName) {
    const selectedOption = $('#numeric-filter-select-' + columnName.replace(/\s+/g, '')).val();
    $('#filter-value-' + columnName.replace(/\s+/g, '')).hide();
    $('#min-value-' + columnName.replace(/\s+/g, '')).hide();
    $('#max-value-' + columnName.replace(/\s+/g, '')).hide();

    if (selectedOption === 'equals' || selectedOption === 'greater' || selectedOption === 'less') {
        $('#filter-value-' + columnName.replace(/\s+/g, '')).show();
    } else if (selectedOption === 'between') {
        $('#min-value-' + columnName.replace(/\s+/g, '')).show();
        $('#max-value-' + columnName.replace(/\s+/g, '')).show();
    }
};
window.applyNumericFilter = function (columnName, bodyId) {
    const selectedOption = $('#numeric-filter-select-' + columnName.replace(/\s+/g, '')).val();
    const filterValue = parseFloat($('#filter-value-' + columnName.replace(/\s+/g, '')).val());
    const minValue = parseFloat($('#min-value-' + columnName.replace(/\s+/g, '')).val());
    const maxValue = parseFloat($('#max-value-' + columnName.replace(/\s+/g, '')).val());

    if (!isNaN(filterValue) || (!isNaN(minValue) && !isNaN(maxValue))) {

        const tableId = $('#' + bodyId).closest('table').attr('id');
        var filteredArray = window[`filteredData_${tableId}`].filter(item => {
            const cellValue = parseFloat(item[columnName]);
            let shouldShow = false;

            switch (selectedOption) {
                case "equals":
                    shouldShow = cellValue === filterValue;
                    break;
                case "greater":
                    shouldShow = cellValue > filterValue;
                    break;
                case "less":
                    shouldShow = cellValue < filterValue;
                    break;
                case "between":
                    shouldShow = cellValue >= minValue && cellValue <= maxValue;
                    break;
            }

            return shouldShow;
        });

        window[`filteredData_${tableId}`] = filteredArray;
        renderTable(filteredArray, bodyId);
        if (window[`Paginator_${tableId}`]) {
            createPaginator(tableId, bodyId);
            renderTableWithPagination(tableId, bodyId);
        }
        const th = $('#filterDropdown-' + columnName.replace(/\s+/g, '')).closest('th');
        const span = th.find('span.filter-table-heading');
        span.find('.fa-filter').remove();
        span.append('<i class="fa-solid fa-filter" style="color: #072d66; margin-left: 5px;"></i>');
    }

    closeAllFilters();
};
window.ClearFilter = function ClearFilter(bodyId) {
    $('.filter-dropdown').hide();
    $('.filter-input').val('');
    $('.filter-input-double').val('');
    $('.filter-dropdown-double').hide();
    const tableId = $('#' + bodyId).closest('table').attr('id');
    window[`filteredData_${tableId}`] = window[`filteredDataTemp_${tableId}`];
    renderTable(window[`filteredData_${tableId}`], bodyId);
    if (window[`Paginator_${tableId}`]) {
        createPaginator(tableId, bodyId);
        renderTableWithPagination(tableId, bodyId);
    }
    $("#" + tableId + " th span.filter-table-heading .fa-filter").remove();
}
window.applyStringFilters = function applyStringFilters(columnName, bodyId) {
    var column = columnName;
    var selectedValues = [];
    $('#checkbox-container-' + column.replace(/\s+/g, '') + ' input:checked').each(function () {
        if ($(this).val() != "All") {
            selectedValues.push($(this).val());
        }
    });

    if (selectedValues.length > 0) {
        const tableId = $('#' + bodyId).closest('table').attr('id');

        var filteredArray = window[`filteredData_${tableId}`].filter(item =>
            selectedValues.includes(item[column]) || selectedValues.includes("All")
        );


        window[`filteredData_${tableId}`] = filteredArray;
        renderTable(filteredArray, bodyId);
        if (window[`Paginator_${tableId}`]) {
            createPaginator(tableId, bodyId);
            renderTableWithPagination(tableId, bodyId);
        }
        const th = $('#filterDropdown-' + column.replace(/\s+/g, '')).closest('th');
        const span = th.find('span.filter-table-heading');
        span.find('.fa-filter').remove();
        span.append('<i class="fa-solid fa-filter" style="color: #072d66; margin-left: 5px;"></i>');
    }
    closeAllFilters();
}
window.ShowEntry = function ShowEntry(columnName, bodyId) {
    var column = columnName;
    populateFilterOptionsDouble(column, bodyId);
    $('#checkbox-container-double-' + column.replace(/\s+/g, '')).toggle();
}
window.populateFilterOptionsDouble = function populateFilterOptionsDouble(columnName, bodyId) {
    var uniqueValues = new Set();
    const tableId = $('#' + bodyId).closest('table').attr('id');
    window[`filteredData_${tableId}`].forEach(function (row) {
        if (row.hasOwnProperty(columnName)) {
            uniqueValues.add(row[columnName]);
        }
    });
    var checkboxContainer = $('#checkbox-container-double-' + columnName.replace(/\s+/g, ''));
    checkboxContainer.empty();
    checkboxContainer.append('<label><input type="checkbox" class="filter-checkbox" value="All"> All</label>');
    uniqueValues.forEach(function (value) {
        checkboxContainer.append('<label><input type="checkbox" class="filter-checkbox" value="' + value + '"> ' + value + '</label>');
    });
    checkboxContainer.find('input[value="All"]').change(function () {
        var isChecked = $(this).is(':checked');
        checkboxContainer.find('input[type="checkbox"]').not(this).prop('checked', isChecked);
    });
    checkboxContainer.find('input[type="checkbox"]').not('input[value="All"]').change(function () {
        var allChecked = checkboxContainer.find('input[type="checkbox"]').not('input[value="All"]').length ===
            checkboxContainer.find('input[type="checkbox"]:checked').not('input[value="All"]').length;
        checkboxContainer.find('input[value="All"]').prop('checked', allChecked);
    });
}
window.applyfilterdouble = function applyfilterdouble(columnName, bodyId) {
    var column = columnName;
    var filterType = $('#filter-type-' + column.replace(/\s+/g, '')).val();
    var searchValue = $('.filter-input-double[data-column="' + column.replace(/\s+/g, '') + '"]').val().trim().toLowerCase();
    var selectedValues = [];

    $('#checkbox-container-double-' + column.replace(/\s+/g, '') + ' input:checked').each(function () {
        if ($(this).val() !== "All") {
            selectedValues.push($(this).val().toLowerCase());
        }
    });
    var useCheckboxFilter = selectedValues.length > 0;
    var useTextFilter = searchValue.length > 0;
    if (useCheckboxFilter || useTextFilter) {
        const tableId = $('#' + bodyId).closest('table').attr('id');
        var filteredArray = window[`filteredData_${tableId}`].filter(item => {
            var cellValue = item[columnName].toLowerCase();
            var showRow = false;

            if (useTextFilter) {
                if (filterType === "startsWith" && cellValue.startsWith(searchValue)) {
                    showRow = true;
                } else if (filterType === "endsWith" && cellValue.endsWith(searchValue)) {
                    showRow = true;
                } else if (filterType === "like" && cellValue.includes(searchValue)) {
                    showRow = true;
                }
            } else if (useCheckboxFilter) {
                showRow = selectedValues.includes(cellValue);
            }

            return showRow;
        });

        window[`filteredData_${tableId}`] = filteredArray;
        renderTable(filteredArray, bodyId);
        if (window[`Paginator_${tableId}`]) {
            createPaginator(tableId, bodyId);
            renderTableWithPagination(tableId, bodyId);
        }
        const th = $('#filterDropdown-' + column.replace(/\s+/g, '')).closest('th');
        const span = th.find('span.filter-table-heading');
        span.find('.fa-filter').remove();
        span.append('<i class="fa-solid fa-filter" style="color: #072d66; margin-left: 5px;"></i>');
    }
    closeAllFiltersDouble();
};
window.closeAllFiltersDouble = function closeAllFiltersDouble() {
    $('.filter-dropdown-double').hide();
    $('.checkbox-container-double').hide();
}
window.applyfilterdate = function applyfilterdate(columnName, bodyId) {
    var column = columnName;
    var selectedValues = [];
    $('#checkbox-container-' + column.replace(/\s+/g, '') + ' input:checked').each(function () {
        if ($(this).val() != "All") {
            selectedValues.push($(this).val());
        }
    });
    columnFilters[column] = selectedValues;
    applyFilters(bodyId);
    closeAllFilters();
}
window.renderTableHeader = function renderTableHeader(hiddenColumns, headerId, bodyId, columns, button, StringFilterColumn, NumericFilterColumn, DateFilterColumn, StringdoubleFilterColumn) {
    const $header = $(`#${headerId}`);
    $header.empty();
    let headerRow = '<tr>';
    columns.forEach(col => {
        let filterHtml = '';
        if (StringFilterColumn.includes(col)) {
            filterHtml = `<th>
                                         <div class="filter-table-heading-div">
                                          <span class="filter-table-heading">${col}</span>
                                            <span class="table-filter-arrow">
                                              <i class="fa-solid fa-angle-down" onclick="OpenFilter('${col.replace(/\s+/g, '')}')" style="cursor: pointer;"></i>
                                            </span>
                                              <div class="filter-division" id="filterDropdown-${col.replace(/\s+/g, '')}" style="display:none;">
                                                <div class="dropdown-content">
                                                  <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="asc">
                                                    <i class="fa-solid fa-arrow-up-a-z sort-indicator sort-indicator-color"></i> Ascending
                                                  </div>
                                                  <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="desc">
                                                    <i class="fa-solid fa-arrow-down-z-a sort-indicator sort-indicator-color"></i> Descending
                                                  </div>
                                                  <div class="dropdown-item fafilter" onclick="toggleFilter('${col}','${bodyId}')">
                                                    <i class="fa-solid fa-filter  sort-indicator-color"></i> Filter...
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div class="filter-dropdown" id="filter-${col.replace(/\s+/g, '')}">
                                            <input type="text" placeholder="Search..." class="filter-input form-control form-control-sm" data-column="${col.replace(/\s+/g, '')}" />
                                            <div class="checkbox-container" id="checkbox-container-${col.replace(/\s+/g, '')}"></div>
                                            <hr>
                                            <button class="btn btn-success btn-height" onclick="applyStringFilters('${col}','${bodyId}')" data-column="${col.replace(/\s+/g, '')}">Apply</button>
                                            <button class="btn btn-success btn-height" onclick="ClearFilter('${bodyId}')">Clear</button>
                                            </div>
                                           </div>
                                     </th>`;
        } else if (NumericFilterColumn.includes(col)) {
            filterHtml = `<th>
                                         <div class="filter-table-heading-div">
                                              <span class="filter-table-heading">${col}</span>
                                              <span class="table-filter-arrow">
                                                  <i class="fa-solid fa-angle-down" onclick="OpenFilter('${col.replace(/\s+/g, '')}')" style="cursor: pointer;"></i>
                                                </span>
                                                  <div class="filter-division" id="filterDropdown-${col.replace(/\s+/g, '')}" style="display:none;">
                                                    <div class="dropdown-content">
                                                      <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="asc">
                                                        <i class="fa-solid fa-arrow-up-a-z sort-indicator  sort-indicator-color"></i> Ascending
                                                      </div>
                                                      <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="desc">
                                                        <i class="fa-solid fa-arrow-down-z-a sort-indicator  sort-indicator-color"></i> Descending
                                                      </div>
                                                      <div class="dropdown-item fafilter" onclick="toggleFilterNumeric('filter-dropdown-numeric-${col.replace(/\s+/g, '')}','${col}');">
                                                        <i class="fa-solid fa-filter  sort-indicator-color"></i> Filter...
                                                      </div>
                                                    </div>
                                                  </div>
                                               </div>
                                         <div class="filter-dropdown" id="filter-dropdown-numeric-${col.replace(/\s+/g, '')}">
                                          <select id="numeric-filter-select-${col.replace(/\s+/g, '')}" onchange="toggleNumericInputs('${col}')">
                                                <option value="equals">=</option>
                                                <option value="greater">></option>
                                                <option value="less">&lt;</option>
                                                <option value="between">Between</option>
                                            </select>
                                            <div class="filter-inputs">
                                                <input type="number" id="filter-value-${col.replace(/\s+/g, '')}" class="filter-input form-control form-control-sm" placeholder="Enter value" />
                                                <input type="number" id="min-value-${col.replace(/\s+/g, '')}" class="filter-input form-control form-control-sm" placeholder="Min value" style="display:none" />
                                                <input type="number" id="max-value-${col.replace(/\s+/g, '')}" class="filter-input form-control form-control-sm" placeholder="Max value" style="display:none" />
                                            </div>
                                            <button class="btn btn-success btn-height" onclick="applyNumericFilter('${col}','${bodyId}')">Apply</button>
                                            <button class="btn btn-success btn-height" onclick="ClearFilter('${bodyId}')">Clear</button>
                                         </div>
                                         </th>`;
        } else if (DateFilterColumn.includes(col)) {
            filterHtml = ` <th>
                                            <div class="filter-table-heading-div">
                                              <span class="filter-table-heading"> ${col}</span>
                                              <span class="table-filter-arrow">
                                                  <i class="fa-solid fa-angle-down" onclick="OpenFilter('${col.replace(/\s+/g, '')}')" style="cursor: pointer;"></i>
                                                </span>
                                                  <div class="filter-division" id="filterDropdown-${col.replace(/\s+/g, '')}" style="display:none;">
                                                    <div class="dropdown-content">
                                                      <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="asc">
                                                        <i class="fa-solid fa-arrow-up-a-z sort-indicator  sort-indicator-color"></i> Ascending
                                                      </div>
                                                      <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="desc">
                                                        <i class="fa-solid fa-arrow-down-z-a sort-indicator  sort-indicator-color"></i> Descending
                                                      </div>
                                                      <div class="dropdown-item fafilter" onclick="populateDateFilter('${col}','${bodyId}')">
                                                        <i class="fa-solid fa-filter  sort-indicator-color"></i> Filter...
                                                      </div>
                                                    </div>
                                                  </div>
                                               </div>
                                            <div class="filter-dropdown" id="filter-${col.replace(/\s+/g, '')}">
                                            <div class="checkbox-container" id="checkbox-container-${col.replace(/\s+/g, '')}"></div>
                                            <button class="btn btn-success btn-height" onclick="applyfilterdate('${col}','${bodyId}')" data-column="${col.replace(/\s+/g, '')}">Apply</button>
                                            <button class="btn btn-success btn-height" onclick="ClearFilter('${bodyId}')">Clear</button>
                                            </div>
                                       </th>`;
        } else if (StringdoubleFilterColumn.includes(col)) {
            filterHtml = `<th>
                                           <div class="filter-table-heading-div">
                                         <span class="filter-table-heading">${col}</span>
                                         <span class="table-filter-arrow">
                                             <i class="fa-solid fa-angle-down" onclick="OpenFilter('${col.replace(/\s+/g, '')}')" style="cursor: pointer;"></i>
                                           </span>
                                             <div class="filter-division" onclick="stopPropagationdouble(event)" id="filterDropdown-${col.replace(/\s+/g, '')}" style="display:none;">
                                               <div class="dropdown-content">
                                                 <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="asc">
                                                   <i class="fa-solid fa-arrow-up-a-z sort-indicator  sort-indicator-color"></i> Ascending
                                                 </div>
                                                 <div class="dropdown-item" onclick="sortable(this)" data-column="${col.replace(/\s+/g, '')}" data-order="desc">
                                                   <i class="fa-solid fa-arrow-down-z-a sort-indicator  sort-indicator-color"></i> Descending
                                                 </div>
                                                 <div class="dropdown-item fafilter" onclick="toggleFilterDouble('${col}','${bodyId}')">
                                                   <i class="fa-solid fa-filter  sort-indicator-color"></i> Filter...
                                                 </div>
                                               </div>
                                             </div>
                                          </div>
                                        <div class="filter-dropdown-double" onclick="stopPropagationdouble(event)" id="filter-double-${col.replace(/\s+/g, '')}">
                                         <select class="filter-type" id="filter-type-${col.replace(/\s+/g, '')}">
                                            <option value="startsWith">Starts With</option>
                                            <option value="endsWith">Ends With</option>
                                            <option value="like">Between</option>
                                        </select>
                                        <input type="text" placeholder="Search..." class="filter-input-double form-control form-control-sm" data-column="${col.replace(/\s+/g, '')}" />
                                        <div class="checkbox-container-double" id="checkbox-container-double-${col.replace(/\s+/g, '')}"></div>
                                        <button class="btn btn-success btn-height" onclick="applyfilterdouble('${col}','${bodyId}')" data-column="${col.replace(/\s+/g, '')}">Apply</button>
                                        <button class="btn btn-primary btn-height" onclick="ShowEntry('${col}','${bodyId}')" data-column="${col.replace(/\s+/g, '')}">Show Entries</button>
                                        <button class="btn btn-success btn-height" onclick="ClearFilter('${bodyId}')">Clear</button>
                                        </div>
                                    </th>`;
        } else if (hiddenColumns.includes(col)) {
            filterHtml = `<th style="display:none">${col}</th>`
        }
        else {
            filterHtml = `<th>${col}</th>`;
        }
        headerRow += `${filterHtml}`;
    });
    if (button) {
        headerRow += '<th style="min-width:120px !important">Action</th></tr>';
    } else {
        headerRow += '</tr>';
    }
    $header.append(headerRow);
}
window.sortable = function sortable(element) {
    var column = $(element).data('column');
    var index = $(element).closest('th').index();
    var order = $(element).data('order');
    var tbodyId = $(element).closest('table').find('tbody').attr('id');
    $(element).data('order', order);
    sortTable(index, order, tbodyId);
};
window.sortTable = function sortTable(columnIndex, order, tbodyId) {
    var rows = $(`#${tbodyId} tr`).get();
    rows.sort(function (a, b) {
        var keyA = $(a).children('td').eq(columnIndex).text().trim();
        var keyB = $(b).children('td').eq(columnIndex).text().trim();
        if ($.isNumeric(keyA) && $.isNumeric(keyB)) {
            return (order === 'asc') ? keyA - keyB : keyB - keyA;
        } else {
            return (order === 'asc') ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA);
        }
    });
    $.each(rows, function (index, row) {
        $(`#${tbodyId}`).append(row);
    });
    CloseFilter();
}
window.stopPropagationdouble = function stopPropagationdouble(event) {
    event.stopPropagation();
};
window.renderTable = function renderTable(items, bodyId) {
    let showButtons = ''
    const tableId = $('#' + bodyId).closest('table').attr('id');
    var button = window[`button_${tableId}`];
    if (button == true) {
        showButtons = window[`ShowButtons_${bodyId}`]
    }

    const rows = items.map((item, index) => {
        const row = Object.keys(item).map((key) => {
            const alignment = window[`columnAlignment_${bodyId}`][key] || 'left';
            const style = window[`hiddenColumns_${bodyId}`].includes(key)
                ? 'display:none'
                : `text-align:${alignment}`;

            return `<td style="${style}">${item[key]}</td>`;
        }).join('');

        let buttons = '';

        if (button == true && Array.isArray(showButtons) && showButtons.length > 0) {
            buttons = '<td>';
            if (showButtons.includes('E')) {
                buttons += ` <button class="btn btn-primary icon-height mb-1" title="Edit"><i aria-hidden="true" class="fa fa-pencil" type="button" onclick="EditData('${item.Code}')" /></i></button> `;
            }
            if (showButtons.includes('D')) {
                buttons += ` <button class="btn btn-danger icon-height mb-1" title="Delete"><i aria-hidden="true" class="fa fa-trash" type="button" onclick="DeleteData('${item.Code}')" /></i></button> `;
            }
            if (showButtons.includes('V')) {
                buttons += `<button class="btn btn-info icon-height mb-1" title="View"> <i aria-hidden="true" class="fa fa-eye" type="button" onclick="ViewData('${item.Code}')" value="View"/></i></button> `;
            }
            if (showButtons.includes('VE')) {
                buttons += `<button class="btn btn-success icon-height mb-1" title="Verify"><i class="fa fa-check" type="button" onclick="VerifyData('${item.Code}')" value="Verify"/></i></button> `;
            }
            if (showButtons.includes('A')) {
                buttons += `<button class="btn btn-warning icon-height mb-1" title="Approve"><i class="fa fa-check-square-o" type="button" onclick="ApproveData('${item.Code}')" value="Approve"/></i></button> `;
            }
            if (showButtons.includes('M')) {
                buttons += `<button class="btn btn-info icon-height mb-1" title="More Info"><i class="" type="button" onclick="MoreData('${item.Code}')" value="..."/></i></button> `;
            }

            buttons += '</td>';
        }

        return `<tr data-index="${index}">${row}${buttons}</tr>`;
    }).join('');

    $(`#${bodyId}`).html(rows);
}
window.updatePageInfo = function updatePageInfo(tableId) {
    var filteredData = window[`filteredData_${tableId}`];
    var currentPage = window[`currentPage_${tableId}`];
    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    const maxPage = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    if (itemsPerPage >= filteredData.length) {
        currentPage = 1;
    } else if (currentPage > maxPage) {
        currentPage = maxPage;
    }
    window[`currentPage_${tableId}`] = currentPage;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, filteredData.length);
    $(`#pageInfo-${tableId}`).text(`${start} – ${end} of ${filteredData.length}`);
}
window.updateButtons = function updateButtons(tableId) {
    var filteredData = window[`filteredData_${tableId}`];
    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    var currentPage = window[`currentPage_${tableId}`];
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    $(`#firstBtn-${tableId}, #prevBtn-${tableId}`).prop('disabled', currentPage === 1);
    $(`#nextBtn-${tableId}, #lastBtn-${tableId}`).prop('disabled', currentPage === totalPages);
}
window.renderTableWithPagination = function renderTableWithPagination(tableId, bodyId) {
    updatePageInfo(tableId);
    var filteredData = window[`filteredData_${tableId}`];
    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    var currentPage = window[`currentPage_${tableId}`];

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToDisplay = filteredData.slice(start, end);
    renderTable(itemsToDisplay, bodyId);

    updateButtons(tableId);
}
window.firstBtn = function firstBtn(tableId, bodyId) {
    var currentPage = window[`currentPage_${tableId}`];
    window[`currentPage_${tableId}`] = 1;
    renderTableWithPagination(tableId, bodyId);
};
window.prevBtn = function prevBtn(tableId, bodyId) {
    var currentPage = window[`currentPage_${tableId}`];

    if (currentPage > 1) {
        window[`currentPage_${tableId}`]--;
        renderTableWithPagination(tableId, bodyId);
    }
};
window.nextBtn = function nextBtn(tableId, bodyId) {
    var filteredData = window[`filteredData_${tableId}`];
    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    var currentPage = window[`currentPage_${tableId}`];
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        window[`currentPage_${tableId}`]++;
        renderTableWithPagination(tableId, bodyId);
    }
};
window.lastBtn = function lastBtn(tableId, bodyId) {
    var filteredData = window[`filteredData_${tableId}`];
    var currentPage = window[`currentPage_${tableId}`];

    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    window[`currentPage_${tableId}`] = Math.ceil(filteredData.length / itemsPerPage);
    renderTableWithPagination(tableId, bodyId);
};
window.pageSize = function pageSize(tableId, bodyId) {
    let itemsPerPage = parseInt($(`#pageSize-${tableId}`).val());
    var currentPage = window[`currentPage_${tableId}`];

    currentPage = 1;
    renderTableWithPagination(tableId, bodyId);
};
window.createPaginator = function createPaginator(tableId, bodyId) {
    $('#paginator-' + tableId).empty();
    var filterHtml = `
        <div class="page-size-select">
            <label for="pageSize-${tableId}" style="display:none">Lines Per Page:</label>
            <select onchange="pageSize('${tableId}','${bodyId}')" class="pageSize" id="pageSize-${tableId}">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>   
            </select>
        </div>
        <button id="firstBtn-${tableId}" onclick="firstBtn('${tableId}','${bodyId}')" class="btn btn-primary paginator-btn icon-height">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="24" height="24" class="svg-icon">
                <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path>
            </svg>
        </button>
        <button id="prevBtn-${tableId}" onclick="prevBtn('${tableId}','${bodyId}')" class="btn btn-primary paginator-btn icon-height">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="24" height="24" class="svg-icon">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
        </button>
        <span class="page-info" id="pageInfo-${tableId}">1 – 10 of 0</span>
        <button id="nextBtn-${tableId}" onclick="nextBtn('${tableId}','${bodyId}')" class="btn btn-primary paginator-btn icon-height">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="24" height="24" class="svg-icon">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
        </button>
        <button id="lastBtn-${tableId}" onclick="lastBtn('${tableId}','${bodyId}')" class="btn btn-primary paginator-btn icon-height">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="24" height="24" class="svg-icon">
                <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path>
            </svg>
        </button>
    `;

    $('#paginator-' + tableId).append(filterHtml);
}
window.OpenFilter = function OpenFilter(columnName) {
    $(".filter-division").hide();
    $("#filterDropdown-" + columnName).show();
}
window.CloseFilter = function CloseFilter() {
    $(".filter-division").hide();
}

