from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator,EmptyPage

from .models import User,Posts,UserFollow



def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)


        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]


        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def posts(request):
    if request.method == "POST":
        comment = request.POST['comment']
        user = request.user
        f = Posts(comments = comment , username = user)
        f.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request,"network/index.html")


def all_posts(request):
    posts = Posts.objects.select_related('username').annotate(
        like_count=Count('like')
    ).values(
        'id', 'comments', 'date', 'username__username', 'username__id', 'like_count'
    ).order_by('-date')
    page_number = request.GET.get('page', 1)
    paginator = Paginator(posts, 10)
    try:
        page = paginator.page(page_number)
    except EmptyPage:
        return JsonResponse({"error": "Page out of range"}, status=404)
    data = {
        "posts": list(page.object_list),
        "page": page.number,
        "total_pages": paginator.num_pages
    }
    return JsonResponse(data, safe=False)

def user_data(request,id):
    userinfo = User.objects.filter(pk = id).values('username','id')
    return JsonResponse(list(userinfo),safe= False)
def userpost(request,id):
    try:
        userinfo = User.objects.get(pk = id)
        user_post = userinfo.posts.annotate(like_count=Count('like')).values('username__username','id','username__id','comments','date','like_count').order_by('-date')
        pagenator = Paginator(user_post,10)
        page_number = request.GET.get('page',10)
        try:
            page = pagenator.page(page_number)
        except EmptyPage:
            return JsonResponse({
                "error" : "page doesnt exist"
            })
        data = {
            "posts":list(page.object_list),
            "page" :page.number,
            "total_pages":pagenator.num_pages
        }
        return JsonResponse(data,safe=False)
    except User.DoesNotExist :
        return JsonResponse({"error" : "user does not exist"},status = 404)
    
def authenticated(request):
    curr_user = request.user
    user_info = {
        "username" : curr_user.username,
        "id":curr_user.id         
                 }
    is_authenticated = curr_user.is_authenticated
    return JsonResponse({
        "is_authenticated" : is_authenticated,
        "user":user_info
    }) 

@csrf_exempt
def follow(request):
    if request.method == "POST":
        data = json.loads(request.body)
        useracc_id = data.get('useracc')
        following_id = data.get('following')

        useracc_info = User.objects.get(pk = useracc_id)
        following_info = User.objects.get(pk = following_id)
        is_following = UserFollow.objects.filter(useracc = useracc_info , following = following_info).exists()
        is_following_info = UserFollow.objects.filter(useracc = useracc_info , following = following_info).first()
        if not is_following:
            try:
                f = UserFollow(useracc = useracc_info,following = following_info)
                f.save()
                is_following = True
                return JsonResponse({"success" : True , "message" : f"{useracc_id} followed {following_id}","isfollowing":is_following},status = 201)
            except User.DoesNotExist:
                return JsonResponse({"success":False,"error":"User does not exist"},status = 404)
        else:
                is_following_info.delete()
                is_following = False
                return JsonResponse({"success": True,"message":f"{useracc_id} unfollowed {following_id}"},status = 201)
    else:
        return JsonResponse({"success":False,"error":"Wrong method","isfollowing":is_following},status = 400)

def is_following(request,id):
    useracc_info = request.user
    following_info = User.objects.get(pk = id)
    is_follows = UserFollow.objects.filter(useracc = useracc_info , following = following_info).exists()
    return JsonResponse({
        "is_following":is_follows
    })

@csrf_exempt
def like_post(request):
    if request.method == "POST":
        try:
            islike = False
            data  = json.loads(request.body)
            post_id = data.get('post_id')
            curr_user = request.user
            post_info = Posts.objects.get(pk = post_id)
            islike = post_info.like.filter(pk = curr_user.id).exists()
            if not islike :
                post_info.like.add(curr_user)
                islike = True
                return JsonResponse({
                "success":True , "message":f"{curr_user.username} liked post with mesasage : {post_info.comments}","islike" : islike
                })
            else:
                post_info.like.remove(curr_user)
                islike = False
                return JsonResponse({"Success":True,"Message":f"{curr_user.username} unliked post with mesasage : {post_info.comments}",islike : islike})
        except Posts.DoesNotExist :
            return JsonResponse({"success":False , "message":"Post does not exist","islike" : islike})
    else:
        return JsonResponse({"success":False , "message":"Invalid Method","islike" : islike})

@csrf_exempt
def is_like(request):
    if request.method  == "POST":
        try:
            data = json.loads(request.body)
            post_id = data.get('postid')
            userinfo = request.user
            postinfo = Posts.objects.get(pk = post_id)
            islike = postinfo.like.filter(pk = userinfo.pk).exists()
            return JsonResponse({
            "islike":islike,"comment":postinfo.comments
            })
        except Exception as e:
            print(f"Error: {e}")
            return JsonResponse({"error": str(e)}, status=500)

def followcount(request,userid):
    userinfo = User.objects.get(pk = userid)
    following_count = UserFollow.objects.filter(useracc = userinfo).count()
    follower_count = UserFollow.objects.filter(following = userinfo).count()
    return JsonResponse({
        "following":following_count,"follower":follower_count
    })

def likecount(request,postid):
    postinfo = Posts.objects.get(pk = postid)
    likecount = postinfo.like.all().count()
    return JsonResponse({
        "likecount":likecount
    }) 

def following_posts(request):
    curr_user = request.user
    following_user= UserFollow.objects.filter(useracc = curr_user)
    following_user_id = following_user.select_related('following').values('following__id')
    posts = Posts.objects.filter(username__id__in = following_user_id).annotate(like_count=Count('like')).values('comments','id','username__username','username__id','date','like_count').order_by('-date')
    paginator = Paginator(posts,10)
    page_number = request.GET.get('page',1)
    try:
        page = paginator.page(page_number)
    except:
        return JsonResponse({"error" : "page doesnt exist"})
    data = {"posts" : list(page.object_list),
            "page" : page.number,
            "total_page" : paginator.num_pages}
    return JsonResponse(data,safe=False)

@csrf_exempt
def edit_post(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            postid = data.get('postid')
            new_comment = data.get('comment')
            postinfo = Posts.objects.get(pk = postid)
            postinfo.comments = new_comment
            postinfo.save()
            comment = postinfo.comments
            return JsonResponse({
                "success":True,"message":f"{postid} comment changed to {new_comment}","comment":comment
            })
        except json.JSONDecodeError:
            return JsonResponse({
            "sucess":False,"message":"invalid json"
        })
        except Posts.DoesNotExist:
            return JsonResponse({
                "sucess":False,"message":"Post doesnt exist"
            },status = 404)
    else:
         return JsonResponse({
            "success":False,"message":"wrong method"
        },status = 405)

