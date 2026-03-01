import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://finance-api-2-fikd.onrender.com/api/token/', credentials);
            const token = res.data.access;
            localStorage.setItem('token', token); // On stocke le jeton dans le navigateur
            setToken(token); // On informe l'application qu'on est connecté
        } catch (err) {
            setError('Identifiants invalides. Réessayez.');
        }
    };

    return (
        <div style={loginContainerStyle}>
            <div style={loginCardStyle}>
                <h2 style={{ textAlign: 'center', color: '#1e293b' }}>Connexion FinancePro 🔐</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Nom d'utilisateur" 
                        style={inputStyle}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        style={inputStyle}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    />
                    <button type="submit" style={btnStyle}>Se connecter</button>
                </form>
            </div>
        </div>
    );
};

// Styles rapides
const loginContainerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' };
const loginCardStyle = { padding: '40px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const btnStyle = { padding: '12px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default Login;