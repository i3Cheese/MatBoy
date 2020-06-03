$(document).bind("scroll", scrolling);

let postN = 0;
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
        postN = 0;
        block = false;
        loader();
    });
});

function loader() {
    $.ajax({
            url: API_URL + `tournament/${tournamentId}/posts/${statusPost}`,
            type: 'GET',
        }
    ).done(function (data) {
        let container = $('#post_container');
        if (!data.posts.length) {
            if (!container.children('div').length) {
                let card = $(document.querySelector('template#empty_posts').content).children(".post_card").clone();
                container.prepend(card);
            }
            return
        }
        let posts = data.posts;
        if (postN >= posts.length + inpCount) {
            block = true;
            return
        }
        for (let n = postN; n < postN + inpCount; ++n) {
            if (n >= posts.length) {
                block = true;
                break
            }
            let card
            if (posts[n].status === 1) {
                card = $(document.querySelector('template#visible-card-post').content).children(".post_card").clone();
            } else if (posts[n].status === 0) {
                card = $(document.querySelector('template#not-visible-card-post').content).children(".post_card").clone();
            }
            card.children(".title").html(posts[n].title);
            card.children('.content').html(posts[n].content);
            card.children(".datetime_info").html(posts[n].created_info);
            card.data("post_id", posts[n].id);
            card.data("status", posts[n].status);
            container.prepend(card);
        }
        postN += inpCount;
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
    let card = targetElem.parents('div.post_card');
    let title = card.find('.title').html();
    let content = card.find('.content').html();
    let dateTimeInfo = card.find('.datetime_info').html();
    let postId = card.data('post_id');
    let status = card.data('status');
    console.log(statusPost);
    if (status === 1) {
        $.ajax({
            url: API_URL + `post/${postId}`,
            type: 'PUT',
            data: {
                status: 0
            }
        });
    } else if (status === 0) {
        $.ajax({
            url: API_URL + `post/${postId}`,
            type: 'PUT',
            data: {
                status: 1
            }
        });
    }
    if (statusPost === 10) {
        card.empty();
        if (status === 1) {
            card.html($($('template#not-visible-card-post').html()).html());
            card.data("status", 0);
        } else if (status === 0) {
            card.html($($('template#visible-card-post').html()).html());
            card.data("status", 1);
        }
        card.children(".title").html(title);
        card.children('.content').html(content);
        card.children(".datetime_info").html(dateTimeInfo);
        card.data("post_id", postId);
    } else {
        card.remove();
    }
});