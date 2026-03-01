from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Transaction, Dette
from .serializers import TransactionSerializer, DetteSerializer
from decimal import Decimal

# 1. Gestion CRUD des Transactions
class TransactionViewSet(viewsets.ModelViewSet):
    """
    Permet de lister, créer, modifier et supprimer des transactions.
    Les transactions sont triées par date décroissante.
    """
    queryset = Transaction.objects.all().order_by('-date_operation')
    serializer_class = TransactionSerializer

# 2. Gestion CRUD des Dettes
class DetteViewSet(viewsets.ModelViewSet):
    """
    Permet de gérer les dettes clients (créances).
    Utilisé par React pour marquer une dette comme 'payée' via PATCH.
    """
    queryset = Dette.objects.all().order_by('-date_echeance')
    serializer_class = DetteSerializer

# 3. Intelligence Financière (Le Cerveau de l'App)
class AnalyseFinanciere(APIView):
    """
    Calcule le bilan en temps réel en combinant transactions et dettes encaissées.
    """
    def get(self, request):
        # Somme des Revenus et Dépenses via le journal des transactions
        revenus_trans = Transaction.objects.filter(type='REVENU').aggregate(Sum('montant'))['montant__sum'] or Decimal('0')
        depenses_trans = Transaction.objects.filter(type='DEPENSE').aggregate(Sum('montant'))['montant__sum'] or Decimal('0')
        
        # Somme des dettes que les clients ont déjà payées
        dettes_payees = Dette.objects.filter(est_paye=True).aggregate(Sum('montant'))['montant__sum'] or Decimal('0')
        
        # Somme des dettes encore en attente (Argent dehors)
        dettes_impayees = Dette.objects.filter(est_paye=False).aggregate(Sum('montant'))['montant__sum'] or Decimal('0')

        # CALCULS FINAUX
        # Le total des entrées d'argent = Revenus direct + Dettes récupérées
        total_entrees = float(revenus_trans + dettes_payees)
        total_sorties = float(depenses_trans)
        solde_net = total_entrees - total_sorties
        creances_clients = float(dettes_impayees)
        
        # LOGIQUE DE CONSEIL AUTOMATISÉE
        recommandation = "Votre santé financière est stable."
        
        if solde_net < 0:
            recommandation = "⚠️ Alerte : Trésorerie négative ! Réduisez vos charges urgemment."
        elif creances_clients > (total_entrees * 0.3) and total_entrees > 0:
            recommandation = f"📢 Action requise : {creances_clients} FCFA sont en attente. Relancez vos impayés !"
        elif total_sorties > (total_entrees * 0.8) and total_entrees > 0:
            recommandation = "💡 Conseil : Vos dépenses absorbent 80% de vos revenus. Optimisez vos coûts."

        return Response({
            "solde_actuel": solde_net,
            "total_revenus": total_entrees,
            "total_depenses": total_sorties,
            "dettes_a_recouvrer": creances_clients,
            "recommandation": recommandation
        })