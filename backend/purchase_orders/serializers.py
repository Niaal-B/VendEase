from django.utils import timezone
from rest_framework import serializers
from .models import PurchaseOrder

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ("acknowledgment_date",) 
    
    def create(self, validated_data):
        now = timezone.now()
        validated_data['order_date'] = now
        validated_data['issue_date'] = now
        validated_data['status'] = 'pending'
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('acknowledgment_date', None)
        return super().update(instance, validated_data)