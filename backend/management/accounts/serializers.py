from rest_framework import serializers
from .models import CustomUser 

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    has_employee_profile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'groups', 'has_employee_profile']

    def get_has_employee_profile(self, obj):
        try:
            return obj.employee is not None
        except Exception:
            return False

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):
        role_name = validated_data.pop('role', 'Employee')
        email = validated_data['email'].strip().lower()
        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        
        # Ensure role has correct casing (e.g. 'Admin', 'Employee', 'Manager')
        role_name = role_name.capitalize()
        if role_name == 'Admin':
            user.is_staff = True
            user.save()
            
        from django.contrib.auth.models import Group
        group, created = Group.objects.get_or_create(name=role_name)
        user.groups.add(group)
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email").strip().lower()
        password = attrs.get("password")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid password.")

        attrs["user"] = user

        return attrs