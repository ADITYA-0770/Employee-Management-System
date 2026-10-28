from django.utils import timezone
from datetime import time, timedelta, datetime
from .models import AttendanceSession, Attendance

def close_lingering_sessions(employee=None):
    """
    Automatically checks out any AttendanceSessions that were left open:
    - Sessions from previous dates (attendance__date < today)
    - Sessions running longer than 14 hours
    
    Sets the checkout_time to standard end-of-shift (6:00 PM) or checkin_time + 8 hours,
    and recalculates that day's total_working_time.
    """
    now = timezone.now()
    today = now.date()

    query = AttendanceSession.objects.filter(checkout_time__isnull=True)
    if employee:
        query = query.filter(attendance__employee=employee)

    # Find unclosed sessions from past days or older than 14 hours
    open_sessions = [
        s for s in query.select_related('attendance')
        if s.attendance.date < today or (s.checkin_time and (now - s.checkin_time) > timedelta(hours=14))
    ]

    closed_count = 0
    for session in open_sessions:
        att = session.attendance
        # Default auto-checkout: 6:00 PM (18:00) on that attendance date
        try:
            default_close = timezone.make_aware(
                datetime.combine(att.date, time(18, 0, 0))
            )
        except Exception:
            default_close = session.checkin_time + timedelta(hours=8) if session.checkin_time else now

        if session.checkin_time and default_close > session.checkin_time:
            checkout_dt = default_close
        elif session.checkin_time:
            # If checked in after 6 PM, add standard 8 hours
            checkout_dt = session.checkin_time + timedelta(hours=8)
        else:
            checkout_dt = now

        session.checkout_time = checkout_dt
        if session.checkin_time:
            session.duration = checkout_dt - session.checkin_time
        session.save()

        # Recalculate total_working_time for that day's attendance
        total = timedelta()
        for s in att.sessions.all():
            if s.duration:
                total += s.duration
        att.total_working_time = total
        att.save()

        closed_count += 1

    return closed_count
