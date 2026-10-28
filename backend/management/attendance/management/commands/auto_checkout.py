from django.core.management.base import BaseCommand
from django.utils import timezone
from attendance.services import close_lingering_sessions

class Command(BaseCommand):
    help = 'Automatically checks out employees who forgot to check out at the end of the day'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force check out open sessions regardless of time'
        )

    def handle(self, *args, **options):
        self.stdout.write(f"[{timezone.now()}] Running auto-checkout for unclosed attendance sessions...")
        closed_count = close_lingering_sessions()
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully completed auto-checkout. {closed_count} open session(s) closed and updated."
            )
        )
