from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
import smtplib




@receiver(post_save, sender=Notification)
def send_notification_email(sender, instance:Notification, created, **kwargs):
    if created:
        # Email configuration
        sender_email = "travelagencyt36@gmail.com"
        receiver_email = instance.recipient.email
        password = "rode twmm lyyn fnmq"  
        subject = f'{instance.priority}-{instance.title}'
        body = f'You have a new notification:\nType: {instance.type}\n\n{instance.message}'


        text = f'Subject: {subject}\n\n{body}'


        server = smtplib.SMTP("smtp.gmail.com",587)
        server.starttls()
        server.login(sender_email,password)
        server.sendmail(sender_email,receiver_email,text)


def send_mail(receiver_email, subject, body):
    sender_email = "travelagencyt36@gmail.com"
    text = f'Subject: {subject}\n\n{body}'
    password = "rode twmm lyyn fnmq"  
    server = smtplib.SMTP("smtp.gmail.com",587)
    server.starttls()
    server.login(sender_email,password)
    server.sendmail(sender_email,receiver_email,text)

