import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 

// --- PROTECTION URL ---
const RAW_URL = process.env.REACT_APP_API_URL || 'https://finance-api-2-fikd.onrender.com';
const API_URL = RAW_URL.replace(/\/+$/, ""); 

const AjoutTransaction = ({ onTransactionAdded }) => {
    const [formData, setFormData] = useState({
        type: 'REVENU',
        montant: '',
        description: '', 
        categorie: 'Vente', 
        date_operation: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 1. On convertit et on nettoie le montant avant l'envoi
        const montantNettoye = parseFloat(formData.montant);

        // 2. Sécurité : Si le montant n'est pas un nombre valide, on arrête tout
        if (isNaN(montantNettoye) || montantNettoye <= 0) {
            toast.error("Veuillez saisir un montant valide (ex: 5000)");
            return;
        }
        
        const payload = {
            type: formData.type,
            montant: montantNettoye, // Nombre pur (ex: 5000.0)
            description: formData.description.trim(),
            categorie: formData.categorie,
            date_operation: formData.date_operation
        };

        // Appel API
        axios.post(`${API_URL}/api/transactions/`, payload)
            .then(() => {
                toast.success("Opération enregistrée ! 📈");
                
                // Reset du formulaire (on garde le type et la date par défaut)
                setFormData({ ...formData, montant: '', description: '' });
                
                if (onTransactionAdded) onTransactionAdded(); 
            })
            .catch(err => {
                // Affichage précis de l'erreur du serveur dans la console
                console.error("Détails Erreur Backend :", err.response?.data);
                
                // Si le serveur renvoie une erreur spécifique sur le montant
                if (err.response?.data?.montant) {
                    toast.error(`Erreur Montant : ${err.response.data.montant[0]}`);
                } else {
                    toast.error("Erreur : Impossible d'enregistrer l'opération.");
                }
            });
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>➕ Nouvelle Opération</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})} 
                        style={{ ...inputStyle, flex: 1 }}
                    >
                        <option value="REVENU">📈 Revenu (Entrée)</option>
                        <option value="DEPENSE">📉 Dépense (Sortie)</option>
                    </select>

                    <select 
                        value={formData.categorie}
                        onChange={(e) => setFormData({...formData, categorie: e.target.value})} 
                        style={{ ...inputStyle, flex: 1 }}
                    >
                        <option value="Vente">Vente</option>
                        <option value="Achat">Achat</option>
                        <option value="Service">Service</option>
                        <option value="Loyer">Loyer</option>
                        <option value="Autre">Autre</option>
                    </select>
                </div>

                <input 
                    type="number" 
                    step="any" // Permet les décimales si besoin
                    placeholder="Montant (FCFA)" 
                    value={formData.montant}
                    required 
                    style={inputStyle}
                    onChange={(e) => setFormData({...formData, montant: e.target.value})} 
                />

                <input 
                    type="text" 
                    placeholder="Description (ex: Vente de marchandises)" 
                    value={formData.description}
                    required
                    style={inputStyle}
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />

                <button 
                    type="submit" 
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    Enregistrer l'opération
                </button>
            </form>
        </div>
    );
};

// --- STYLES ---
const containerStyle = { 
    padding: '20px', 
    backgroundColor: '#fff', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
};

const inputStyle = { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    outline: 'none', 
    fontSize: '0.95em',
    backgroundColor: '#f8fafc'
};

const buttonStyle = { 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    transition: 'background 0.3s' 
};

export default AjoutTransaction;