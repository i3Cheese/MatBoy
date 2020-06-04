$(document).bind("scroll", scrolling);

let last_id = -1;
let inpCount = 3;
let block = false;
let tournamentId = window.location.pathname.split('/')[2];
let statusPost = 1;

window.onload = loader;

function scrolling() {
    if (($(window).scrollTop() === $(document).height() - $(window).height()) && !block) {
        loader();
    }
}


$(document).ready(function () {
    let dropDownMenu = $('.dropdown');
    let currentStatus = dropDownMenu.children('button#dropdownMenuButton');
    let allStatusButtons = dropDownMenu.find('button.dropdown-item');
    let container = $('#post_container');
    allStatusButtons.bind('click', function (target) {
        currentStatus.html($(target.target).html());
        statusPost = parseInt($(target.target).val(), 10);
        container.empty();
        reloadLoader();
    });

    let subscribeEmailInput = $('#subscribe-email-input');
    let subscribeVkInput = $('#subscribe-vk-input');
    subscribeEmailInput.bind('change', function () {
        let status
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-email',
            type: 'POST',
            data: {status: status, tour_id: tournamentId}
        });
    });
    subscribeVkInput.bind('change', function () {
        let status
        if (this.checked) {
            status = 1;
        } else {
            status = 0
        }
        $.ajax({
            url: '/subscribe-vk',
            type: 'POST',
            data: {status: status, tour_id: tournamentId}
        });
    });
});


function displayEmptyPost() {
    let container = $('#post_container');
    if (!container.children('div').length) {
        let card = $(document.querySelector('template#empty_posts').content).children(".post_card").clone();
        container.prepend(card);
    }
}


function reloadLoader() {
    last_id = -1;
    block = false;
    loader();
}

function generateTemplateCard(card, title, content, datetime_info, post_id, status) {
    card.children(".title").html(title);
    card.children('.content').html(content);
    card.children(".datetime_info").html(datetime_info);
    card.data("post_id", post_id);
    card.data("status", status);
}

function loader() {
    let type;
    switch(statusPost) {
        case 0:
            type = 'hidden';
            break;
        case 1:
            type = 'visible';
            break;
        case 10:
            type = 'all';
            break;
    }
    url = `tournament/${tournamentId}/posts?type=${type}&offset=${inpCount}`;
    if (~last_id){
        url += `&last_id=${last_id}`;
    }

    $.ajax({
            url: API_URL + url,
            type: 'GET',
        }
    ).done(function (data) {
        let container = $('#post_container');
        let posts = data.posts
        
        posts.forEach(post => {
            let card
            if (post.status === 1) {
                card = $(document.querySelector('template#visible-card-post').content).children(".post_card").clone();
            } else if (post.status === 0) {
                card = $(document.querySelector('template#not-visible-card-post').content).children(".post_card").clone();
            }
            generateTemplateCard(card, post.title, post.content,
                post.created_info, post.id, post.status);
            container.prepend(card);
        });
        if (posts.length < inpCount){
            block = true;
        } else {
            last_id = posts.pop().id
        }
    });
}

$(document).on('click', '.edit', function (event) {
    let targetElem = $(event.target);
    let card = targetElem.parents('div.post_card');
    let postId = card.data('post_id');
    window.location.href = `/tournament/${tournamentId}/edit_post/${postId}`;
});

$(document).on('click', '.hide', function (event) {
    let targetElem = $(event.target);
    let container = $('#post_container');
    let card = targetElem.parents('div.post_card');
    let title = card.find('.title').html();
    let content = card.find('.content').html();
    let dateTimeInfo = card.find('.datetime_info').html();
    let postId = card.data('post_id');
    let status = card.data('status');
    let newStatus
    if (status === 0) {
        newStatus = 1
    } else if (status === 1) {
        newStatus = 0
    }
    $.ajax({
        url: API_URL + `post/${postId}`,
        type: 'PUT',
        data: {
            status: newStatus
        }
    }).done(function () {
        if (statusPost === 10) {
            card.empty();
            if (newStatus === 0) {
                card.html($($('template#not-visible-card-post').html()).html());
            } else if (newStatus === 1) {
                card.html($($('template#visible-card-post').html()).html());
            }
            generateTemplateCard(card, title, content, dateTimeInfo, postId, newStatus)
        } else {
            card.remove();
        }
        if (container.children('div').length === 0) {
            reloadLoader();
        }
    });
});


$(document).on('click', '.delete', function (event) {
    let targetElem = $(event.target);
    let card = targetElem.parents('div.post_card');
    let postId = card.data('post_id');
    let container = $('#post_container');
    $.ajax({
        url: API_URL + `post/${postId}`,
        type: 'DELETE'
    }).done(function () {
        card.remove();
    }).always(function () {
        console.log(container.children('div').length);
        if (container.children('div').length === 0) {
            reloadLoader();
        }
    });
});