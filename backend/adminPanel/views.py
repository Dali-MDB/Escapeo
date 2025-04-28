from django.shortcuts import render

# admin/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from .models import Visit

class VisitorStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        month_start = today.replace(day=1)

        top_countries = (
            Visit.objects.values('country')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        visitors_today = Visit.objects.filter(created_at__date=today).count()
        visitors_month = Visit.objects.filter(created_at__date__gte=month_start).count()

        bounce_rate = 0
        total = Visit.objects.count()
        if total:
            bounce_rate = round((Visit.objects.filter(duration_seconds__lt=10).count() / total) * 100, 2)

        avg_duration = Visit.objects.aggregate(avg=Avg('duration_seconds'))['avg'] or 0

        return Response({
            "top_countries": top_countries,
            "visitors_today": visitors_today,
            "visitors_this_month": visitors_month,
            "bounce_rate": f"{bounce_rate}%",
            "avg_duration_seconds": round(avg_duration, 1)
        })





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.utils.timezone import now
from rest_framework import status
from .models import Visitor
from .utils import get_client_ip
from reservation.models import TripReservation
from main.models import User , Admin , Customer

# Track a visit
class TrackVisitView(APIView):
    def get(self, request):
        ip = get_client_ip(request)
        path = request.path
        Visitor.objects.create(ip_address=ip)
        return Response({'message': 'Visit logged'})


@api_view(['GET'])
def daily_visitor_count(request):
    year = int(request.query_params.get('year', now().year))
    month = int(request.query_params.get('month', now().month))
    day = int(request.query_params.get('day', now().day))

    count = Visitor.objects.filter(
        timestamp__year=year,
        timestamp__month=month,
        timestamp__day=day
    ).count()

    return Response({'year': year, 'month': month, 'day': day, 'visits': count})


# Get monthly stats
@api_view(['GET'])
def monthly_visitor_count(request):
    year = int(request.query_params.get('year', now().year))
    month = int(request.query_params.get('month', now().month))

    count = Visitor.objects.filter(
        timestamp__year=year,
        timestamp__month=month
    ).count()

    return Response({'year': year, 'month': month, 'visits': count})

@api_view(['GET'])
def yearly_visitor_count(request):
    year = int(request.query_params.get('year', now().year))
    month = int(request.query_params.get('month', now().month))
    day = int(request.query_params.get('day', now().day))

    count = Visitor.objects.filter(
        timestamp__year=year,
        
    ).count()

    return Response({'year': year, 'month': month, 'day': day, 'visits': count})


@api_view(['GET'])
def top_destinations(request):
    filter_type = request.query_params.get('filter', 'all')
    today = now().date()
    
   
    if filter_type == 'last_7_days':
        start_date = today - timedelta(days=7)
    elif filter_type == 'last_month':
        start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    elif filter_type == 'last_year':
        start_date = today.replace(year=today.year - 1, month=1, day=1)
    else:
        start_date = None  

    reservations = TripReservation.objects.all()

    if start_date:
        reservations = reservations.filter(date__gte=start_date)

    
    top = reservations.values(destination=F('trip__destination')).annotate(
        count=Count('id')
    ).order_by('-count')

    return Response({'filter': filter_type, 'top_destinations': top})

@api_view(['GET'])
def top_5_destinations(request):
    filter_type = request.query_params.get('filter', 'all')
    today = now().date()
    

    if filter_type == 'last_7_days':
        start_date = today - timedelta(days=7)
    elif filter_type == 'last_month':
        start_date = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
    elif filter_type == 'last_year':
        start_date = today.replace(year=today.year - 1, month=1, day=1)
    else:
        start_date = None

    
    reservations = TripReservation.objects.all()
    if start_date:
        reservations = reservations.filter(date__gte=start_date)

    
    top = (
        reservations
        .values(destination=F('trip__destination'))
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )

    return Response({'filter': filter_type, 'top_5_destinations': top})



@api_view(['GET'])
@permission_classes([IsAdminUser])
def most_visited_paths(request):
    
    top_paths = (
        Visit.objects
        .exclude(path__isnull=True)
        .exclude(path="")
        .values('path')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    return Response({'top_paths': top_paths})


class UserCountView(APIView) :
    def get(self,request,type=None):
        if type=="admin":
            count=Admin.objects.count()
            return Response({"admins":count})
        elif type=="customer":
            count=Customer.objects.count()
            return Response({"customers":count})
        elif type is None:
            count=User.objects.count()
            return Response({"users":count})
        else :
            return Response({"error": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)

