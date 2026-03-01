import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// On récupère l'URL dynamique (Localhost ou Render)
const API_URL = process.env.REACT_APP_API_URL || 'https://finance-api-2-fikd.onrender.com';

const AjoutDette = ({ onDetteAdded }) => {
    const [formData, setFormData] = useState({
        client: '',
        montant: '',
        date_echeance: new Date().toISOString().split('T')[0] 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const dataToSend = {
            client: formData.client,
            montant: parseFloat(formData.montant),
            date_echeance: formData.date_echeance,
            est_paye: false
        };

        // Utilisation de la variable API_URL
        axios.post(`${API_URL}/api/dettes/`, dataToSend)
        .then(() => {
            toast.success("🤝 Dette enregistrée !");
            
            // Reset du formulaire
            setFormData({ 
                client: '', 
                montant: '', 
                date_echeance: new Date().toISOString().split('T')[0] 
            });
            onDetteAdded(); 
        })
        .catch(err => {
            console.error("Erreur lors de l'ajout :", err);
            toast.error("Impossible d'enregistrer la dette.");
        });
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ color: '#856404', marginTop: 0 }}>🤝 Enregistrer un Impayé</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <input 
                    placeholder="Nom du Client" 
                    value={formData.client} 
                    required 
                    onChange={e => setFormData({...formData, client: e.target.value})} 
                    style={inputStyle} 
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="number" 
                        placeholder="Montant (FCFA)" 
                        value={formData.montant} 
                        required 
                        onChange={e => setFormData({...formData, montant: e.target.value})} 
                        style={{ ...inputStyle, flex: 1 }} 
                    />
                    <input 
                        type="date" 
                        value={formData.date_echeance} 
                        required 
                        onChange={e => setFormData({...formData, date_echeance: e.target.value})} 
                        style={{ ...inputStyle, flex: 1 }} 
                    />
                </div>
                <button type="submit" style={buttonStyle}>Enregistrer la Dette</button>
            </form>
        </div>
    );
};

// Styles (inchangés)
const containerStyle = { padding: '20px', backgroundColor: '#fffbe6', borderRadius: '12px', border: '1px solid #ffe58f' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' };
const buttonStyle = { backgroundColor: '#856404', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default AjoutDette;