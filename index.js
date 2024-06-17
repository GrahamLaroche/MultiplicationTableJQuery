/*
    File: index.js
    GUI Assignment: Using the JQuery Plugin with Dynamic Table
    Graham Laroche, graham_laroche@student.uml.edu
    6/13/2024
    A script that uses a form to generate a multiplication table.
*/
const MAX_RANGE = 100;    //Maximum number of rows or columns
const MAX_VALUE = 500;    //Highest valid number input 
let tableCreated = false; //Whether or not a table exists

let savedValues = { //Storing previous form inputs
    minCols: [],
    maxCols: [],
    minRows: [],
    maxRows: []
};

//Add custom validation rules
jQuery.validator.addMethod('integer',  isValidInteger, 'Integer numbers are required.');
jQuery.validator.addMethod('validSize', isValidSize,
    'Numbers cannot be larger than 500, or smaller than -500.');
jQuery.validator.addMethod('lessThan', isLessThan, 
    'Minimum values cannot be greater than maximum values.');
jQuery.validator.addMethod('greaterThan', isGreaterThan,
    'Maximum values cannot be less than minimum values.');
jQuery.validator.addMethod('validRange', isValidRange, 
    'There cannot be more than 100 rows or 100 columns. Try increasing min values or decreasing max values.')

//Implement custom validation rules for text input boxes
jQuery.validator.addClassRules('numberInput', {
    required: true,
    number: true,
    integer: true,
    validSize: true
});
$('#multForm').validate({
    rules: {
        minCol: {
            lessThan: '#maxCol',
            validRange: '#maxCol'
        },
        maxCol: {
            greaterThan: '#minCol',
            validRange: '#minCol'
        },
        minRow: {
            lessThan: '#maxRow',
            validRange: '#maxRow'
        },
        maxRow: {
            greaterThan: '#minRow',
            validRange: '#minRow'
        }
    }
});

//Set JQuery UI slider properties and events.
$('.slider').slider({
    min: -MAX_VALUE,
    max: MAX_VALUE,
    slide: setTextInputValue
});
//Set JQuery UI tab events.
$('#tabs').tabs({
    activate: loadNewTab
})    

// Returns true if value is an integer, false otherwise
function isValidInteger(value) {
    return Number.isInteger(Number(value));
}

// Returns true if value is less than or equal to a max value constant, false otherwise
function isValidSize(value) {
    return Number(value) <= MAX_VALUE;
}

// Returns true if value is less than or equal to param's value, false otherwise
function isLessThan(value, _element, param) {
    if (value == '' || $(param).val() == ''){
        return true;
    }
    else if (!isValidInteger(value) || !isValidInteger($(param).val())){
        return true;
    }
    return (Number(value) <= Number($(param).val()));
}

// Returns  true if value is greater than or equal to param's value, false otherwise
function isGreaterThan(value, _element, param) {
    if (value == '' || $(param).val() == ''){
        return true;
    }
    else if (!isValidInteger(value) || !isValidInteger($(param).val())){
        return true;
    }
    return Number(value) >= Number($(param).val());
}

// Returns true if the absolute difference between value and param's value is 100, false otherwise
function isValidRange(value, _element, param) {
    if (value == '' || $(param).val() == ''){
        return true;
    }
    else if (!isValidInteger(value) || !isValidInteger($(param).val())){
        return true;
    }
    return Math.abs(Number(value) - Number($(param).val())) <= MAX_RANGE;
}

// Updates the value of the slider based on the text inputs
function updateSlider(sliderID, textInput) {
    $(sliderID).slider('option', 'value', Number($(textInput).val()));
    revalidateInputs();
    if (tableCreated && isValidForm()) {
        updateTable($('#tabs').tabs('option', 'active'));
    }
}

// Updates error messages for each of the text inputs
function revalidateInputs(){
    $('.numberInput').valid();
}

// Returns true if form is valid, false otherwise
function isValidForm() {
    return $('#multForm').valid()
}

/*
    Adds rows and collumns to an HTML table element.
    @param minCol   Number   The minimum column value
    @param maxCol   Number   The maximum column value
    @param minRow   Number   The minimum row value
    @param maxRow   Number   The maximum row value
*/
function createTable(minCol, maxCol, minRow, maxRow) {
    if(!tableCreated) {
        tableCreated = true;
    }

    let newTable = document.createElement('table'); // HTML table that will be saved to a tab
    
    let i, j; // Used for iterating the following for loops

    appendRow(newTable);
    appendColumn(0, null, 'td', newTable)
    for (i = minCol; i <= maxCol; i+=1){
        appendColumn(0, i, 'th', newTable);
    }

    for (i = minRow; i <= maxRow; i+=1) {
        appendRow(newTable);
        appendColumn(i-minRow+1, i, 'th', newTable)
        for (j = minCol; j <= maxCol; j+=1) {
            appendColumn(i-minRow+1, i*j, 'td', newTable);
        }
    }

    return newTable;
}

// Deletes the table and all its rows
function clearTable(tableID) {
    let table = $('#tabs').children()[tableID+1].firstChild;
   
    if(table == null) { throw 'ERROR: Could not find the specified table to clear!';}
    
    let rowCount = table.rows.length;

    for(let i = 0; i < rowCount; i+=1) {
        table.deleteRow(0);
    }
    table.remove();
}

// Destroys the old table specified by its id and replaces it with a new one
function updateTable(tableID) {
    clearTable(tableID);

    let minCol = Number($('#minCol').val());
    let maxCol = Number($('#maxCol').val());
    let minRow = Number($('#minRow').val());
    let maxRow = Number($('#maxRow').val());

    saveFormInputs([minCol,maxCol,minRow,maxRow], $('#tabs').tabs('option', 'active'));

    let table = createTable(minCol, maxCol, minRow, maxRow);
    $('#tabs').children()[tableID+1].append(table);
}

// Creates a new tab, and a table to be held within it
function saveTable() {
    if (!isValidForm()) {
        return;
    }
    let minCol = Number($('#minCol').val());
    let maxCol = Number($('#maxCol').val());
    let minRow = Number($('#minRow').val());
    let maxRow = Number($('#maxRow').val());

    let tabCount = $('#tabList').children().length + 1;

    let checkItem = document.createElement('li');
    let checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('id', 'check' + tabCount);
    let checkLabel = document.createElement('label');
    checkLabel.setAttribute('for', 'check' + tabCount);
    checkLabel.innerText = 'Table ' + tabCount;

    checkItem.appendChild(checkBox);
    checkItem.appendChild(checkLabel);
    $('#checkList').append(checkItem);

    let tab = document.createElement('li');
    let tabLink = document.createElement('a');
    tabLink.setAttribute('href', '#tab' + tabCount)
    tabLink.innerText='Table ' + tabCount;
    let closeButton = document.createElement('span');
    closeButton.setAttribute('class', 'ui-icon ui-icon-close');
    closeButton.setAttribute('role', 'presentation');
    closeButton.setAttribute('onclick', 'destroyTab(this)');

    tabLink.appendChild(closeButton);
    tab.appendChild(tabLink);

    let tabContent = document.createElement('div');
    tabContent.setAttribute('id', 'tab' + tabCount);

    let table = createTable(minCol, maxCol, minRow, maxRow);
    tabContent.appendChild(table);

    $('#tabList').append(tab);
    $('#tabs').append(tabContent);
    $('#tabs').tabs();
    $('#tabs').tabs('refresh');

    if(tabCount == 1){
        $('#tabs').tabs('option', 'active', 0);
    }
    
    saveFormInputs([minCol, maxCol, minRow,maxRow], tabCount - 1);
}

//  Appends a <tr> tag to the multiplication table.
function appendRow(newTable) {
    let row = document.createElement('tr'); // Create table row element.
    newTable.appendChild(row);
}

/*
    Appends a <td> or a <th> tag to a <tr> element.
    @param rowIndex   Number   Specifies which row is being appended to
    @param value      Number   This is what is displayed in the table data element
    @param cellType   String   The name of the html element being created
*/
function appendColumn(rowIndex, value, cellType, newTable) {
    if(cellType != 'td' && cellType != 'th'){
        throw 'ERROR: tried to append invalid Column type!';
    }
    let col = document.createElement(cellType); // Create table data element.
    col.textContent = value;
    newTable.children[rowIndex].appendChild(col);
}

// Sets text inputs based on slider value
function setTextInputValue(_uiEvent, uiObject) {
    let textBox;

    switch(uiObject.handle) {
        case $('#slider1')[0].firstChild:
            textBox = $('#minCol');
            break;
        case $('#slider2')[0].firstChild:
            textBox = $('#maxCol');
            break;
        case $('#slider3')[0].firstChild:
            textBox = $('#minRow');
            break;
        case $('#slider4')[0].firstChild:
            textBox = $('#maxRow');
            break;
        default:
            throw 'ERROR: Could not find matching slider element!';
    }

    textBox.val(uiObject.value);
    revalidateInputs();

    if (tableCreated && isValidForm()) {
        updateTable($('#tabs').tabs('option', 'active'));
    }
}

// Triggers upon new tab being active, loads that tab's form input
function loadNewTab(_uiEvent, _uiObject) {
    if($('#tabList').children().length != 1) {
        loadFormInputs($('#tabs').tabs('option', 'active'));
    }
}

// Sets sliders and text inputs of a form to saved values at the given index
function loadFormInputs(index) {
    $('#minCol').val(savedValues.minCols[index]);
    $('#maxCol').val(savedValues.maxCols[index]);
    $('#minRow').val(savedValues.minRows[index]);
    $('#maxRow').val(savedValues.maxRows[index]);

    $('#slider1').slider('option', 'value', savedValues.minCols[index]);
    $('#slider2').slider('option', 'value', savedValues.maxCols[index]);
    $('#slider3').slider('option', 'value', savedValues.minRows[index]);
    $('#slider4').slider('option', 'value', savedValues.maxRows[index]);
}

// Sets a stored text input array at a given index to its corresponding text input
function saveFormInputs(inputs, index) {
    savedValues.minCols[index] = inputs[0];
    savedValues.maxCols[index] = inputs[1];
    savedValues.minRows[index] = inputs[2];
    savedValues.maxRows[index] = inputs[3];
}

// Finds the tab index based on the close button, and destroys it
function closeTab(closeButton) {
    let index = -1;
    for(let i = 0; i < $('#tabList').children().length; i+=1){
        if ($('#tabList').children()[i] == closeButton.parentElement.parentElement) {
            index = i;
        }
    }
    if (index == -1){
        throw 'ERROR: Could not find the tab to be closed!'
    }
    
    destroyTab(index);
}

//Removes the tab, tab contents, checkbox, and refreshes JQuery tabs
function destroyTab(index) {
    let activeTab = $('#tabs').tabs('option', 'active');

    $('#tabList').children()[index].remove();
    $('#tabs').children()[index+1].remove();

    renameTabs();
    resetTabIDs();

    if($('#tabList').children().length == 0){
        tableCreated = false;
    }

    $('#tabs').tabs('refresh');

    resetCloseButtons();

    shiftSavedValues(index);

    if (activeTab == index && tableCreated == true) {
        $('#tabs').tabs('option', 'active', 0);
        loadFormInputs(0);
    }

    $('#checkList').children()[index].remove();

    resetCheckBoxes();
}

// Names each tab to their position
function renameTabs() {
    for(let i = 1; i < $('#tabList').children().length + 1; i+=1) {
        $('#tabList').children()[i-1].firstChild.innerText = 'Table ' + i
    }
}

// Sets each tab id to its position
function resetTabIDs() {
    for(let i = 1; i < $('#tabList').children().length + 1; i+=1) {
        $('#tabList').children()[i-1].firstChild.setAttribute('href', '#tab' + i);
        $('#tabs').children()[i].setAttribute('id', 'tab' + i);
    }
}

// JQuery removes the close buttons on refresh, this function adds them back
function resetCloseButtons() {
    for(let i = 0; i < $('#tabList').children().length; i+=1) {
        let closeButton = document.createElement('span');
        closeButton.setAttribute('class', 'ui-icon ui-icon-close');
        closeButton.setAttribute('role', 'presentation');
        closeButton.setAttribute('onclick', 'closeTab(this)');
        $('#tabList').children()[i].firstChild.appendChild(closeButton);
    }
}

// Deletes a specific element and copies over all remaining elements to fill the space
function shiftSavedValues(index) {
    for(let i = index; i < savedValues.minCols.length - 1; i+=1) {
        savedValues.minCols[i] = savedValues.minCols[i+1];
        savedValues.maxCols[i] = savedValues.maxCols[i+1];
        savedValues.minRows[i] = savedValues.minRows[i+1];
        savedValues.maxRows[i] = savedValues.maxRows[i+1];
    }
    savedValues.minCols.pop();
    savedValues.maxCols.pop();
    savedValues.minRows.pop();
    savedValues.maxRows.pop();
}

// Sets each checkbox id to its position
function resetCheckBoxes() {
    for(let i = 1; i < $('#checkList').children().length + 1; i+=1) {

        let checkBox = $('#checkList').children()[i-1].firstChild;
        checkBox.setAttribute('id', 'check ' + i);
        let checkLabel = $('#checkList').children()[i-1].children[1];
        checkLabel.setAttribute('for', 'check' + i);
        checkLabel.innerText = 'Table ' + i;
    }
}

// Deletes each tab that had its corresponding check mark checked
function closeSelectedTabs() {
    let i = 0;
    while( i < $('#checkList').children().length) {
        if( $('#checkList').children()[i].firstChild.checked) {
            destroyTab(i);
        }
        else{
            i+=1;
        }
    }
}