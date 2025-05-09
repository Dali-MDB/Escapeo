from django.core.management.base import BaseCommand
from main.tasks import update_trip_status, expire_unpaid_reservations, free_occupied_rooms, update_reservation_statuses

class Command(BaseCommand):
    help = 'Runs tasks that are scheduled to be run'
    print('gg')
    def handle(self, *args, **kwargs):
        # Run tasks one by one
        update_trip_status()
        self.stdout.write(self.style.SUCCESS("Successfully ran update_trip_status task."))

        expire_unpaid_reservations()
        self.stdout.write(self.style.SUCCESS("Successfully ran expire_unpaid_reservations task."))

        free_occupied_rooms()
        self.stdout.write(self.style.SUCCESS("Successfully ran free_occupied_rooms task."))

        update_reservation_statuses()
        self.stdout.write(self.style.SUCCESS("Successfully ran update_reservation_statuses task."))
