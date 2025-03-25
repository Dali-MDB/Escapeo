from rest_framework import serializers

class ChatSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=500)
    context = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=[]
    )