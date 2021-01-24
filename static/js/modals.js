function c() {
    window.alert();
}

window.confirm = (message) => {
    $('#PromiseConfirm .modal-body p').html(message);
    var PromiseConfirm = $('#PromiseConfirm').modal({
        keyboard: false,
        backdrop: 'static'
    }).modal('show');
    let confirm = false;
    $('#PromiseConfirm .btn-success').on('click', e => {
        confirm = true;
    });
    return new Promise(function (resolve, reject) {
        PromiseConfirm.on('hidden.bs.modal', (e) => {
            resolve(confirm);
        });
    });
};

$('p a[href="#"]').on('click', async (e) => {
    e.preventDefault();
    if (await confirm('Want to test the Prompt?')) {
        let prmpt = await prompt('Entered value:');
        if (prmpt) await alert(`entered: «${prmpt}»`);
        else await alert('Do not enter a value');
    }
    else await alert('Promise based alert sample');
});


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

$('p a[href="#"]').on('click', async (e) => {
    e.preventDefault();
    await alert('Promise based alert sample');
});


window.prompt = (message) => {
    $('#PromisePrompt .modal-body label').html(message);
    var PromisePrompt = $('#PromisePrompt').modal({
        keyboard: false,
        backdrop: 'static'
    }).modal('show');
    $('#PromisePromptInput').focus();
    let prmpt = null;
    $('#PromisePrompt .btn-success').on('click', e => {
        prmpt = $('#PromisePrompt .modal-body input').val();
    });
    return new Promise(function (resolve, reject) {
        PromisePrompt.on('hidden.bs.modal', (e) => {
            resolve(prmpt);
        });
    });
};