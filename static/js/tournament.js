$(document).bind("scroll", scrolling);

let postN = 0;
let inpCount = 3;
let block = false;

window.onload = loader();

function scrolling() {
    if (($(window).scrollTop() === $(document).height() - $(window).height()) && !block) {
        loader();
    }
}

function loader() {
    let tournamentId = window.location.pathname.split('/')[2];
    $.ajax({
            url: `/api/post/${tournamentId}`,
            type: 'GET',
        }
    ).done(function (data) {
        if (data.posts.length == 0){
            $("#news_title").remove();
            return
        };
        let posts = data.posts;
        if (postN >= posts.length + inpCount) {
            block = true;
            return
        }
        let container = $('#post_container');
        for (let n = postN; n < postN + inpCount; ++n) {
            if (n >= posts.length) {
                block = true;
                break
            }
            let card = $(document.querySelector('template#card').content).children("#post_card").clone();
            card.children("#title").html(posts[n].title);
            card.children('#content').html(posts[n].content);
            card.children("#datetime_info").html(posts[n].created_info);
            container.prepend(card);
        }
        postN += inpCount;
    });
}