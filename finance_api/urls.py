from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Assure-toi d'importer DetteViewSet ici
from core.views import TransactionViewSet, AnalyseFinanciere, DetteViewSet 

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'dettes', DetteViewSet) # <-- CETTE LIGNE MANQUAIT !

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Toutes les routes CRUD (transactions et dettes)
    path('api/', include(router.urls)),
    
    # Route pour l'analyse intelligente
    path('api/analyse/', AnalyseFinanciere.as_view(), name='analyse-financiere'),
]