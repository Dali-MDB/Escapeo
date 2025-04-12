import pusher

pusher_client = pusher.Pusher(
  app_id='1973651',
  key='4b8aedc65def2e33fdf6',
  secret='7c5aa0e6ced63379a79b',
  cluster='eu',
  ssl=True
)

pusher_client.trigger('my-channel', 'my-event', {'message': 'hello world'})