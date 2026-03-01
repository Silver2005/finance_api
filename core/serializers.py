from rest_framework import serializers
from .models import Transaction, Dette # Ajout de Dette ici

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

# Nouveau Serializer pour gérer les dettes clients
class DetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dette
        fields = '__all__'