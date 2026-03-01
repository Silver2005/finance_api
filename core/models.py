from django.db import models

class Transaction(models.Model):
    TYPES = [('REVENU', 'Entrée d\'argent'), ('DEPENSE', 'Sortie d\'argent')]
    type = models.CharField(max_length=10, choices=TYPES)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date_operation = models.DateField()
    # Utilisation de la catégorie pour les filtres et rapports
    categorie = models.CharField(max_length=50) 

class Dette(models.Model):
    # Changé 'partenaire' en 'client' pour correspondre au formulaire React
    client = models.CharField(max_length=100) 
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    # Changé 'echeance' en 'date_echeance' pour la clarté
    date_echeance = models.DateField() 
    est_paye = models.BooleanField(default=False)