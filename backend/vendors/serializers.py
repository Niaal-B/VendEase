from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Vendor, HistoricalPerformance

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = (
            "on_time_delivery_rate",
            "quality_rating_avg",
            "average_response_time",
            "fulfillment_rate",
        )

class VendorPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = (
            "id",
            "name",
            "vendor_code",
            "on_time_delivery_rate",
            "quality_rating_avg",
            "average_response_time",
            "fulfillment_rate",
        )

class HistoricalPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalPerformance
        fields = "__all__"
        read_only_fields = ("date",)

class VendorRegistrationSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True, min_length=8)
    
    # Vendor fields
    name = serializers.CharField(max_length=255, required=True)
    contact_details = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    vendor_code = serializers.CharField(max_length=50, required=True)
    
    # Response fields
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    vendor = VendorSerializer(read_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_vendor_code(self, value):
        if Vendor.objects.filter(vendor_code=value).exists():
            raise serializers.ValidationError("A vendor with this vendor code already exists.")
        return value
    
    def create(self, validated_data):
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Create Vendor linked to User
        vendor = Vendor.objects.create(
            name=validated_data['name'],
            contact_details=validated_data['contact_details'],
            address=validated_data['address'],
            vendor_code=validated_data['vendor_code'],
            user=user
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'vendor': vendor,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }