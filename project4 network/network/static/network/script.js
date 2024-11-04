document.addEventListener("DOMContentLoaded",() => {
    fetch("isauthenticated").then(response => response.json()).then(data => {
        console.log(data);
        if(data.is_authenticated){
            document.querySelector('.posting').style.display = "block";
        }
    })
    document.querySelector('#allpost').style.color = "blue";
    document.querySelector('.allposts').style.display = "block";
    document.querySelector('.userpage').style.display = "none";
    document.querySelector('.userposts').style.display = "none";
    document.querySelector('.following_post').style.display = "none";
    document.querySelector('#all').innerHTML = `<h2 class = "follow_text" >All Posts</h2>`;
//navigation username
    document.addEventListener('click',(event) => {
        item = event.target.closest('#username_page');
        if(item){
            document.querySelector('#all').innerHTML = ``;
            document.querySelector('#username_page').style.color = "#0000CD";
            document.querySelector('#allpost').style.color = "";
            document.querySelector('#following_page').style.color = '';
            document.querySelector('.allposts').style.display = "none";
            document.querySelector('.userpage').style.display = "block";
            document.querySelector('.userposts').style.display = "block";
            document.querySelector('.posting').style.display = "none";
            console.log("username clicked");
                        fetch("isauthenticated").then(response => response.json()).then(data =>{
                console.log(data);
                userid = data.user.id;
                fetch(`userdata/${userid}`).then(response => response.json()).then(data=> {
                    console.log(data);
                    userinfo = data[0].username;
                    fetch(`followcount/${userid}`).then(response => response.json()).then(follow => {
                        console.log(follow);
                        document.querySelector('.userpage').innerHTML = "";
                        document.querySelector('.userpage').innerHTML = `
                        
                        <div class = "centeruser">
                        <img src = "https://cdn2.iconfinder.com/data/icons/instagram-ui/48/jee-75-512.png" id = "userprofile" alt = "profile picture">
                        <h5 id = "username1">${userinfo}</h5>
                        <p id = "followers">Followers:${follow.follower}</p> <p id = "following">Following:${follow.following}</p>
                        </div>
                        <hr id = "user-line">`
                        ;
                        document.querySelector('.userposts').innerHTML = '';
                        userpost(userid,page = 1);
                    })
        
                }) 
            })
                
        }
    })

function loadPosts(page = 1) {
    document.querySelector('.allposts').innerHTML = ''; 
    fetch(`/allposts?page=${page}`)
        .then(response => response.json())
        .then(data => {
            const posts = data.posts;
            const totalPages = data.total_pages;
            posts.forEach(post => {
                let inner = document.createElement('div');
                let date = new Date(post.date);
                let newDate = date.toLocaleString();
                inner.className = "postinner";
                inner.setAttribute('data-userid', post.username__id);
                inner.innerHTML = `
                    <div class="headerpost">
                        <h5 id="postuser" data-user-id="${post.username__id}">${post.username__username}</h5>
                        <p id="postdate">${newDate}</p>
                    </div>
                    <p id="postcomment" data-post-id="${post.id}">${post.comments}</p>
                `;
                document.querySelector('.allposts').append(inner);
                fetch(`islike`,{method : "POST",headers:{"Content-Type" : "application/json"},body:JSON.stringify({
                    "postid":post.id
                })}).then(response => response.json()).then(data => {
                    console.log(data);
                    if(data.islike){
                        const likediv = document.createElement('div');
                        likediv.innerHTML = `<p class="like" data-postid="${post.id}">❤️${post.like_count}</p>`
                        inner.append(likediv);
                    }
                    else{
                        const likediv = document.createElement('div');
                        likediv.innerHTML = `<p class="like" data-postid="${post.id}">🤍${post.like_count}</p>`
                        inner.append(likediv);
                    }
                })
                fetch("/isauthenticated")
                    .then(response => response.json())
                    .then(data => {
                        if (data.is_authenticated && data.user.id === post.username__id) {
                            console.log(`userid is same as post userid : ${post.username__username}`);
                            const button = document.createElement('button');
                            button.textContent = "Edit";
                            button.className = "editdiv";
                            button.setAttribute("data-post-id", `${post.id}`);
                            inner.append(button);
                            edit_button(inner, post);
                        }
                    });
            });
            document.addEventListener('click', event => {
                const clickedItem = event.target;
                if (clickedItem.className === "like") {
                    console.log("like button clicked");
                    const id_post = clickedItem.getAttribute('data-postid');
                    fetch("/like", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ "post_id": id_post })
                    })
                    .then(response => response.json())
                    .then(like => {
                        fetch(`/likecount/${id_post}`)
                            .then(response => response.json())
                            .then(likecount => {
                                if(like.islike){
                                    document.querySelector(`.like[data-postid="${id_post}"]`).innerHTML = `❤️${likecount.likecount}`;   
                                }else{
                                    document.querySelector(`.like[data-postid="${id_post}"]`).innerHTML = `🤍${likecount.likecount}`;
                                }
                            });
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
            });
            PaginationControls(totalPages, page);
        })
        .catch(error => {
            console.error("Error loading posts:", error);
        });
    }
    function PaginationControls(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; 
    if(currentPage > 1){
        const prevbtn = document.createElement('button');
        prevbtn.className = "page-button";
        prevbtn.textContent = "Previous";
        prevbtn.onclick = () => loadPosts(currentPage - 1);
        paginationContainer.appendChild(prevbtn)     
    }

    for(let i = 1; i<= totalPages;i++){
        const button = document.createElement('button');
        button.textContent = i;
        button.className = "page-button";
        if(i === currentPage) button.classList.add('active');
        button.onclick = () => loadPosts(i)
        paginationContainer.appendChild(button);
    }
    if(currentPage < totalPages){
        const button = document.createElement('button');
        button.className = "page-button";
        button.textContent = "Next";
        button.onclick = () => loadPosts(currentPage + 1);
        paginationContainer.appendChild(button);
    }
}
loadPosts();
    document.addEventListener('click',(event)=> {
        const items = event.target;
        console.log(items);
        if(items.id === "postuser"){
        document.querySelector('#all').innerHTML = ``;
        fetch("isauthenticated").then(response => response.json()).then(data => {
            if(data.is_authenticated){
                document.querySelector('.posting').style.display = "none";
            }
        })
        document.querySelector('#allpost').style.color = "";
        document.querySelector('#username_page').style.color = "";
        document.querySelector('#following_page').style.color = '';
        document.querySelector('.allposts').style.display = "none";
        document.querySelector('.userpage').style.display = "block";
        document.querySelector('.userposts').style.display = "block";
        document.querySelector('.following_post').style.display = "none";
        userid = items.getAttribute('data-user-id');
        fetch(`userdata/${userid}`).then(response => response.json()).then(data=> {
            console.log(data);
            userinfo = data[0].username;
            fetch(`followcount/${userid}`).then(response => response.json()).then(follow => {
                console.log(follow);
                document.querySelector('.userpage').innerHTML = "";
                document.querySelector('.userpage').innerHTML = `
                
                <div class = "centeruser">
                <img src = "https://cdn2.iconfinder.com/data/icons/instagram-ui/48/jee-75-512.png" id = "userprofile" alt = "profile picture">
                <h5 id = "username1">${userinfo}</h5>
                <p id = "followers">Followers:${follow.follower}</p> <p id = "following">Following:${follow.following}</p>
                </div>
                <hr id = "user-line">`
                ;
                //Follow button 
                fetch("isauthenticated").then(response => response.json()).then(post => {
                    const useracc_id = post.user.id; 
                    console.log(`The data from authenticated ${post.is_authenticated}`)
                    if(post.is_authenticated){
                        if(post.user.username !== userinfo){
                            fetch(`isfollowing/${userid}`).then(response => response.json()).then(data =>{
                                console.log(data);
                                if(!data.is_following)
                                    {   const follow_btn =  document.createElement('div');
                                        follow_btn.className = "follow-btnc"
                                        follow_btn.innerHTML = `<button id  ="follow-btn">Follow</button>`;
                                        document.querySelector('.centeruser').append(follow_btn);}
                                    else{
                                        const follow_btn =  document.createElement('div');
                                        follow_btn.className = "follow-btnc"
                                        follow_btn.innerHTML = `<button id  ="follow-btn">Unfollow</button>`;
                                        document.querySelector('.centeruser').append(follow_btn);
                                    }
                                    document.querySelector('#follow-btn').onclick = function(){
                                        console.log("follow clicked")
                                        fetch("follow",{
                                            method : "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body : JSON.stringify({
                                                "useracc": post.user.id,
                                                "following": userid
                                            })
                                        }).then(response => response.json()).then(follow_data => {
                                            console.log(`Success:${post.user.id} follows ${userid} and ${follow_data.isfollowing}`,follow_data);
                                            if(follow_data.isfollowing){
                                                document.querySelector('#follow-btn').innerHTML = "Unfollow"
                                                let newfollowing = follow.follower + 1;
                                                document.querySelector('#followers').textContent = `Followers:${newfollowing}`;
                                            }
                                            else{
                                                document.querySelector('#follow-btn').innerHTML = "Follow";
                                                let newfollowing = follow.follower - 1 ;
                                                document.querySelector('#followers').textContent = `Followers:${newfollowing}`;
                                            }
    
                                            
                                        }).catch(error => {
                                            console.error(error);
                                            alert(`Error: ${error.error}`);
            
                                        })          
                                     
                                }
                            })
                        }
                    }
                })
    
                document.querySelector('.userposts').innerHTML = '';
                userpost(userid,page = 1);
            })

            


        }) }
    })


//userpost
    function userpost(userid, page = 1) {
        document.querySelector('#allpost').style.color = "";
        document.querySelector('#following_page').style.color = '';
        document.querySelector('.userposts').innerHTML = ''; 
        fetch(`userpost/${userid}?page=${page}`).then(response => response.json()).then(data => {
                const posts = data.posts;
                const totalPages = data.total_pages;
                posts.forEach(post => {
                    let inner = document.createElement('div');
                    inner.setAttribute('data-userid', post.username__id);
                    inner.className = "userpostinner";
                    let date = new Date(post.date);
                    let newDate = date.toLocaleString();
                    inner.innerHTML = `
                        <div class="headerpost">
                            <h5 id="postuser" data-user-id="${post.username__id}">${post.username__username}</h5>
                            <p id="postdate">${newDate}</p>
                        </div>
                        <p id="userpostcomment" data-post-id="${post.id}">${post.comments}</p>
                    `;
                    document.querySelector('.userposts').append(inner);
                    fetch(`islike`,{method : "POST",headers:{"Content-Type" : "application/json"},body:JSON.stringify({
                        "postid":post.id
                    })}).then(response => response.json()).then(data => {
                        console.log(data);
                        if(data.islike){
                            const likediv = document.createElement('div');
                            likediv.innerHTML = `<p class="userlike" data-userpostid="${post.id}">❤️${post.like_count}</p>`
                            inner.append(likediv);
                        }
                        else{
                            const likediv = document.createElement('div');
                            likediv.innerHTML = `<p class="userlike" data-userpostid="${post.id}">🤍${post.like_count}</p>`
                            inner.append(likediv);
                        }
                    })

                    fetch("isauthenticated").then(response => response.json()).then(data => {
                        if (data.is_authenticated && data.user.id === post.username__id) {
                            const button = document.createElement('button');
                            button.textContent = "Edit";
                            button.className = "usereditdiv";
                            button.setAttribute("data-post-id", `${post.id}`);
                            inner.append(button);
                            useredit_button(inner, post);
                        }
                    });
                });

                UserPagination(totalPages, page, userid);
            })
            .catch(error => console.error('Error fetching user posts:', error));
    }
    function UserPagination(totalPages, currentPage, userid) {
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = ''; 
        if(currentPage > 1){
            const button = document.createElement('button');
            button.className = "page-button";
            button.textContent = "Previous";
            button.onclick = ()=> userpost(userid,currentPage - 1);
            paginationContainer.appendChild(button);

        }

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = "page-button";
            button.onclick = () => userpost(userid, i);
            if (i === currentPage) {
                button.classList.add('active');
            }
            paginationContainer.appendChild(button);
        }

        if(currentPage < totalPages){
            const button = document.createElement('button');
            button.className = "page-button";
            button.innerHTML = "Next";
            button.onclick = () => userpost(userid,currentPage + 1);
            paginationContainer.appendChild(button);
        }
    }
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('userlike')) {
            const id_post = event.target.getAttribute('data-userpostid');
            fetch("like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "post_id": id_post })
            }).then(response => response.json())
            .then(like => {
                fetch(`likecount/${id_post}`).then(response => response.json()).then(likecount => {
                    if(like.islike){
                        document.querySelector(`.userlike[data-userpostid="${id_post}"]`).innerHTML = `❤️${likecount.likecount}`;
                    }else{
                        document.querySelector(`.userlike[data-userpostid="${id_post}"]`).innerHTML = `🤍${likecount.likecount}`;
                    }
                    
                });
            }).catch(error => console.log(error));
        }
    });

    

//following page
function load_follow_post(page = 1) {
    fetch("isauthenticated").then(response => response.json()).then(data => {
            console.log(`following page info ${data}`);
            if (data.is_authenticated) {
                document.querySelector('#username_page').style.color = "";
                document.querySelector('#allpost').style.color = "";
                document.querySelector('#following_page').style.color = '#0000CD';
                document.querySelector('.posting').style.display = "none";
                document.querySelector('.allposts').style.display = "none";
                document.querySelector('.userpage').style.display = "none";
                document.querySelector('.userposts').style.display = "none";
                document.querySelector('.like').style.display = "none";
                document.querySelector('.following_post').style.display = "block";
                document.querySelector('#all').innerHTML = `<h2 class = "follow_text">Following</h2><hr>`;
                document.querySelector('.following_post').innerHTML = "";
                fetch(`following_posts?page=${page}`).then(response => response.json()).then(data => {
                        const posts = data.posts;
                        const total_pages = data.total_page;
                        console.log(posts);
                        posts.forEach(post => {
                            const inner = document.createElement('div');
                            inner.className = "postinner";
                            const date = new Date(post.date);
                            const newDate = date.toLocaleString();
                            inner.innerHTML = `
                                <div class="headerpost">
                                    <h5 id="postuser" data-user-id="${post.username__id}">${post.username__username}</h5>
                                    <p id="postdate">${newDate}</p>
                                </div>
                                <p id="postcomment">${post.comments}</p>
                            `;
                            document.querySelector('.following_post').append(inner);
                            fetch(`islike`,{method : "POST",headers:{"Content-Type" : "application/json"},body:JSON.stringify({
                                "postid":post.id
                            })}).then(response => response.json()).then(data => {
                                console.log(data);
                                if(data.islike){
                                    const likediv = document.createElement('div');
                                    likediv.innerHTML = `<p class="userlike" data-postid="${post.id}">❤️${post.like_count}</p>`
                                    inner.append(likediv);
                                }
                                else{
                                    const likediv = document.createElement('div');
                                    likediv.innerHTML = `<p class="userlike" data-postid="${post.id}">🤍${post.like_count}</p>`
                                    inner.append(likediv);
                                }
                            })
                        });
                        FollowingPagination(total_pages, page);
                    });
            }
        });
}

function FollowingPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ""; 
    if(currentPage > 1){
        const prevbtn = document.createElement('button');
        prevbtn.className = "page-button";
        prevbtn.textContent = "Previous";
        prevbtn.onclick = () => load_follow_post(currentPage - 1);
        paginationContainer.appendChild(prevbtn)     
    }

    for(let i = 1; i<= totalPages;i++){
        const button = document.createElement('button');
        button.textContent = i;
        button.className = "page-button";
        if(i === currentPage) button.classList.add('active');
        button.onclick = () => load_follow_post(i)
        paginationContainer.appendChild(button);
    }
    if(currentPage < totalPages){
        const button = document.createElement('button');
        button.className = "page-button";
        button.textContent = "Next";
        button.onclick = () => load_follow_post(currentPage + 1);
        paginationContainer.appendChild(button);
    }
}
document.addEventListener('click', (event) => {
    const itemClicked = event.target;
    if (itemClicked.id === "following_page") {
        console.log("following page clicked");
        load_follow_post(1);
    }
    if (itemClicked.className === "userlike") {
        console.log("like button clicked");
        const postId = itemClicked.getAttribute('data-postid');
        console.log(postId);
        fetch("like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "post_id": postId })
        })
        .then(response => response.json()).then(like => {
            fetch(`likecount/${postId}`)
                .then(response => response.json())
                .then(likeCount => {
                    console.log(`updated like count for the post = ${likeCount.likecount}`);
                    if(like.islike){
                        document.querySelector(`.userlike[data-postid="${postId}"]`).innerHTML = `❤️${likeCount.likecount}`;
                    }
                    else{
                        document.querySelector(`.userlike[data-postid="${postId}"]`).innerHTML = `🤍${likeCount.likecount}`;
                    }
                });
        })
        .catch(error => console.log(error));
    }
});



    
//click edit button
    function edit_button(inner,post){
        
        inner.addEventListener('click',(event) => {
            let item = event.target;
            if(item.className === "editdiv"){
                console.log(`edit button clicked`);
                item.style.display = "none"
                const edit_area = document.createElement('div');
                edit_area.className = "savearea";
                edit_area.innerHTML = `<textarea id = "savetext" data-textid = "${post.id}" placeholder = "new comment..">${post.comments}</textarea>
                <button class = "savebtn">Save</button>`
                item.parentNode.insertBefore(edit_area, item.nextSibling);

            }
            if(item.className === "savebtn"){
                save_button(post);
            }

        })

    }

    //save_button
   function save_button(post){
    let postid = post.id
    console.log(`save button clicked for ${postid}`);
    let new_comment = document.querySelector('#savetext').value;
    console.log(new_comment);
    fetch(`edit_post`,{
        method:"POST",headers:{"Content-Type" : "application/json"},body: JSON.stringify({
            "postid":postid ,"comment":new_comment
        })
    }).then(response => response.json()).then(data => {
        console.log(data);
        console.log(`changed commment : ${data.comment}`)
        document.querySelector('.savearea').style.display = "none";  
        document.querySelector(`#postcomment[data-post-id = "${postid}"]`).textContent= `${data.comment}`; 
        document.querySelector(`.editdiv[data-post-id = "${postid}"]`).style.display = "block";
    }).catch(error => {
        console.log(error);
    })

   }

       
//click user edit button
function useredit_button(inner,post){
        
    inner.addEventListener('click',(event) => {
        let item = event.target;
        if(item.className === "usereditdiv"){
            console.log(`edit button clicked`);
            item.style.display = "none"
            const edit_area = document.createElement('div');
            edit_area.className = "savearea";
            edit_area.innerHTML = `<textarea id = "savetext" data-textid = "${post.id}" placeholder = "new comment..">${post.comments}</textarea>
            <button class = "savebtn">Save</button>`
            item.parentNode.insertBefore(edit_area, item.nextSibling);

        }
        if(item.className === "savebtn"){
            usersave_button(post);
        }

    })

}

//user save_button
function usersave_button(post){
let postid = post.id
console.log(`save button clicked for ${postid}`);
let new_comment = document.querySelector('#savetext').value;
console.log(new_comment);
fetch(`edit_post`,{
    method:"POST",headers:{"Content-Type" : "application/json"},body: JSON.stringify({
        "postid":postid ,"comment":new_comment
    })
}).then(response => response.json()).then(data => {
    console.log(data);
    console.log(`changed commment : ${data.comment}`)
    document.querySelector('.savearea').style.display = "none";  
    document.querySelector(`#userpostcomment[data-post-id = "${postid}"]`).textContent= `${data.comment}`; 
    document.querySelector(`.usereditdiv[data-post-id = "${postid}"]`).style.display = "block";
}).catch(error => {
    console.log(error);
})

}
})