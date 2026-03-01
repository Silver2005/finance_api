import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 

// Récupération de l'URL dynamique
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

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
        
        const payload = {
            type: formData.type,
            montant: parseFloat(formData.montant),
            description: formData.description,
            categorie: formData.categorie,
            date_operation: formData.date_operation
        };

        // Utilisation de la variable API_URL ici
        axios.post(`${API_URL}/transactions/`, payload)
            .then(() => {
                toast.success("Opération enregistrée ! 📈");
                
                // Reset partiel : on garde le type et la catégorie pour gagner du temps
                setFormData({ ...formData, montant: '', description: '' });
                onTransactionAdded(); 
            })
            .catch(err => {
                console.error("Erreur Backend :", err.response?.data);
                toast.error("Erreur : Impossible d'enregistrer l'opération.");
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

                <button type="submit" style={buttonStyle}>
                    Enregistrer l'opération
                </button>
            </form>
        </div>
    );
};

// Styles maintenus
const containerStyle = { padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95em' };
const buttonStyle = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s' };

export default AjoutTransaction;