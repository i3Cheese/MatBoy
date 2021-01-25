window.confirm = (message, swap) => {
    if (swap === true) {
        $('#PromiseConfirm .modal-footer .ok').removeClass('button_primary');
        $('#PromiseConfirm .modal-footer .cancel').removeClass('btn-danger');

        $('#PromiseConfirm .modal-footer .ok').addClass('btn-danger');
        $('#PromiseConfirm .modal-footer .cancel').addClass('button_primary');
    }
    $('#PromiseConfirm .modal-body p').html(message);
    var PromiseConfirm = $('#PromiseConfirm').modal({
        keyboard: false,
        backdrop: 'static'
    }).modal('show');
    let confirm = false;
    $('#PromiseConfirm .ok').on('click', e => {
        confirm = true;
    });
    return new Promise(function (resolve, reject) {
        PromiseConfirm.on('hidden.bs.modal', (e) => {
            resolve(confirm);
        });
    });
};

window.alert = (message) => {
    $('#PromiseAlert .modal-body p').html(message);
    var PromiseAlert = $('#PromiseAlert').modal({
        keyboard: false,
        backdrop: 'static'
    }).modal('show');
    return new Promise(function (resolve, reject) {
        PromiseAlert.on('hidden.bs.modal', resolve);
    });
};

window.prompt = (message) => {
    $('#PromisePrompt .modal-body label').html(message);
    var PromisePrompt = $('#PromisePrompt').modal({
        keyboard: false,
        backdrop: 'static'
    }).modal('show');
    $('#PromisePromptInput').focus();
    let prmpt = null;
    $('#PromisePrompt .button_primary').on('click', e => {
        prmpt = $('#PromisePrompt .modal-body input').val();
    });
    return new Promise(function (resolve, reject) {
        PromisePrompt.on('hidden.bs.modal', (e) => {
            resolve(prmpt);
        });
    });
};


// so, guys, this is an example for INTEGRATION (my fav word, u know) a modals into other functions

// $('p a[href="#"]').on('click', async (e) => {
    // e.preventDefault();
    // if (await confirm('Want to test the Prompt?', true)) {
        // let prmpt = await prompt('Entered value:');
        // if (prmpt) await alert(`entered: «${prmpt}»`);
        // else await alert('Do not enter a value');
    // }
    // else await alert('Promise based alert sample');
// });
// true if confirm is the flag of swiping buttons' colour