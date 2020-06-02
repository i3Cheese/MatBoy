$(document).bind("scroll", scrolling);

let postN = 0;
let inpCount = 3;
let block = false;
let tournamentId = window.location.pathname.split('/')[2];

window.onload = loader;

function scrolling() {
    if (($(window).scrollTop() === $(document).height() - $(window).height()) && !block) {
        loader();
    }
}

function loader() {
    $.ajax({
            url: API_URL + `tournament/${tournamentId}/posts`,
            type: 'GET',
        }
    ).done(function (data) {
        let container = $('#post_container');
        if (!data.posts.length){
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
            let card = $(document.querySelector('template#card').content).children(".post_card").clone();
            card.children(".title").html(posts[n].title);
            card.children('.content').html(posts[n].content);
            card.children(".datetime_info").html(posts[n].created_info);
            card.children(".link_menu").children(".delete").attr("id", (posts[n].id).toString());
            card.children(".link_menu").children(".edit").attr("id", (posts[n].id).toString());
            container.prepend(card);
        }
        postN += inpCount;
    });
}

$(document).on('click', '.edit', function (event) {
    let targetElem = $(event.target);
    let postId = targetElem.attr('id');
    window.location.href = `/tournament/${tournamentId}/edit_post/${postId}`;
});

$(document).on('click', '.delete', function (event) {
    let targetElem = $(event.target);
    let postId = targetElem.attr('id');
    let container = $('#post_container');
    console.log(postId)
    $.ajax({
        url: API_URL + `post/${postId}`,
        type: 'DELETE',
    }).done(function(r) {
        targetElem.parent('div.link_menu').parent('div.post_card').remove()
        if (!container.children('div').length) {
            loader();
        }
    });
});