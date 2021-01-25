const MIN_FIELDS = 4;
const MAX_FIELDS = 8;
let players_form_num = 0;


function fillPlayerForm(additionalInfo, userData={}) {
    let infoList = ['surname', 'name', 'patronymic', 'city', 'birthday'];
    infoList.forEach(function (fieldName) {
        let el = additionalInfo.find(`input.players-${fieldName}`);
        if (fieldName in userData) {
            el.val(userData[fieldName]);
        } else {
            el.val('');
        }
        el.find(`input.players-${fieldName}`).prop('required', false);
    });
}


function checkPlayerForm(liFieldset) {
    let email = liFieldset.find(`.players-email`).val();
    let additionalInfo = liFieldset.find(`fieldset.players-additional_info`);
    fillPlayerForm(additionalInfo);
    if (email === "") return;
    $.ajax({
        url: `/api/user?email=${email}`,
        type: 'get',
        error: holdErrorResponse,
        success: function (data) {
            if (data.exist) {
                fillPlayerForm(additionalInfo, data.user);
            } else {
                additionalInfo.prop("disabled", false);
                additionalInfo.find('.players-birthday').prop("placeholder", '01.01.1970')
            }
        }
    });
}

function onChangePlayerEmail(emailInput) {
    checkPlayerForm($(emailInput).closest(".players-li"));
}

function onInputPlayerEmail(emailInput) {
    $(emailInput).closest(".players-li").find(".players-additional_info").prop('disabled', true);
}


function addPlayerForm(index, email="",) {
    let temp = $("template#user_email_field");
    console.log(temp)
    let liFieldset = $($.parseHTML(temp.html().replaceAll('{}', index)));
    let ul_forms = $("#players");

    ul_forms.append(liFieldset);
    if (email !== "") {
        liFieldset.find(`players-${index}-email`).val(email);
        checkPlayerForm(liFieldset);
    }
}


function addUserEmailField() {
    // adding a new field if theirs count is less than MAX_FIELDS
    if (players_form_num < MAX_FIELDS) {
        addPlayerForm(players_form_num++);
    }
}

function deleteUserEmailField() {
    // deleting last field if theirs count is more than MIN_FIELDS

    if (players_form_num > MIN_FIELDS) {
        let last_li = $("#players").children().last();
        if (last_li) {
            last_li.remove();
        }
        --players_form_num;
    }
}

function addAllEmails () {
    while (players_form_num < emails.length) {
        console.log(emails[players_form_num]);
        addPlayerForm(players_form_num, emails[players_form_num++]);
    }
    while (players_form_num < MIN_FIELDS) {
        console.log(players_form_num);
        addUserEmailField();
    }
}

$(document).ready(addAllEmails);