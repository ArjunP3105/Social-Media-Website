from django.contrib.auth.models import AbstractUser
from django.db import models
import datetime


class User(AbstractUser):
    pass

class Posts(models.Model):
    comments = models.CharField(max_length= 255)
    username = models.ForeignKey('User',on_delete= models.CASCADE , null= True, related_name= "posts")
    date = models.DateTimeField(default= datetime.datetime.now , null= True)
    like = models.ManyToManyField(User,related_name="liked_user",null=True,blank=True)

    def __str__(self):
        return f"{self.username} : {self.comments} on {self.date}"

class UserFollow(models.Model):
    useracc = models.ForeignKey(User,on_delete= models.CASCADE,related_name="useracc")
    following = models.ForeignKey(User,on_delete= models.CASCADE,related_name="following")

    def __str__(self):
        return f"{self.useracc} follows {self.following}"
        

    