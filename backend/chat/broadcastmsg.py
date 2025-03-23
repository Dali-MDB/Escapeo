from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def broadcast_msg_to_chat(message, group_name, user):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'chatroom_message',
            'message': message,
            'username': user,
        }
    )
