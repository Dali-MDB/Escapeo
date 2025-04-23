from rest_framework import serializers
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from main.mail import send_mail

User = get_user_model()
'''
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is associated with this email.")
        return value

    def save(self):
        user = User.objects.get(email=self.validated_data['email'])
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Build URL for frontend to use (you can change the domain/frontend link)
        reset_link = f"http://localhost:3000/reset-password/{uidb64}/{token}/"

        send_mail(
            subject="Password Reset",
            message=f"Click the link to reset your password: {reset_link}",
            from_email="noreply@yourdomain.com",
            recipient_list=[user.email],
        )

        send_mail(
            receiver_email=user.email,
            subject="Password Reset",
            body="we have received a request to reset password for your account.\nif it was you making the request Click the link to reset your password: {reset_link} \nif this action wasn't done by you, simply ignore the email"

        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data['uidb64']))
            self.user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Invalid user")

        if not default_token_generator.check_token(self.user, data['token']):
            raise serializers.ValidationError("Invalid or expired token")

        validate_password(data['new_password'], self.user)
        return data

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()


import random
from .models import PasswordResetCode
class RequestPasswordResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        code = f"{random.randint(100000, 999999)}"

        # Save to DB
        PasswordResetCode.objects.create(user=user, code=code)

        # Send Email
        send_mail(
            receiver_email=user.email,
            subject="Password Reset",
            body=("we have received a request to reset password for your account.\n"
                  f"Your password reset code is: {code}",
                  "if this action wasn't performed by you simply ignore the message"
                  
                )

        )


class ConfirmResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            reset_code = PasswordResetCode.objects.filter(user=user, code=data['code']).last()

            if not reset_code:
                raise serializers.ValidationError("Invalid code.")
            if reset_code.is_expired():
                reset_code.delete()
                raise serializers.ValidationError("Code has expired.")

            self.user = user
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")

        return data

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()
        PasswordResetCode.objects.filter(user=self.user).delete()  # Clean up old codes
'''



import random
import string
from .models import PasswordResetCode

class RequestPasswordResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate a secure random code
        code = ''.join(random.choices(string.digits, k=6))
        
        # Delete any existing reset codes for this user
        PasswordResetCode.objects.filter(user=user).delete()
        
        # Save new code to DB
        PasswordResetCode.objects.create(user=user, code=code)

        # Prepare email content
        email_subject = "Password Reset Code"
        email_body = (
            f"Hello,\n\n"
            f"We received a request to reset your password.\n"
            f"Your verification code is: {code}\n\n"
            f"This code will expire in 10 minutes.\n\n"
            f"If you didn't request this, please ignore this email.\n\n"
            f"Thank you,\n"
            f"The Support Team"
        )
        
        # Use your custom send_mail function
        send_mail(
            receiver_email=user.email,
            subject=email_subject,
            body=email_body
        )

class ConfirmResetCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            reset_code = PasswordResetCode.objects.filter(
                user=user, 
                code=data['code']
            ).last()

            if not reset_code:
                raise serializers.ValidationError({"code": "Invalid code."})
            if reset_code.is_expired():
                reset_code.delete()
                raise serializers.ValidationError({"code": "Code has expired."})

            self.user = user
            self.reset_code = reset_code
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Invalid email."})

        return data

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()
        # Delete only the used code
        self.reset_code.delete()