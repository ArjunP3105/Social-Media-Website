
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts",views.posts ,name = "posts"),
    path("allposts",views.all_posts,name="allposts"),
    path('userdata/<int:id>',views.user_data,name="user_data"),
    path('userpost/<int:id>',views.userpost,name = "userposts"),
    path('isauthenticated',views.authenticated,name = "is_authenticated"),
    path('follow',views.follow,name="follow"),
    path('isfollowing/<int:id>',views.is_following,name="isfollowing"),
    path('like',views.like_post,name="like"),
    path('islike',views.is_like,name = "islike"),
    path('followcount/<int:userid>',views.followcount,name="followcount"),
    path('likecount/<int:postid>',views.likecount,name="likecount"),
    path('following_posts',views.following_posts,name="followingposts"),
    path('edit_post',views.edit_post, name="editpost"),

]
