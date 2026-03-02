import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AjoutTransaction from './components/AjoutTransaction';
import AjoutDette from './components/AjoutDette';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'react-hot-toast';

// --- PROTECTION & NETTOYAGE URL ---
// Supprime les slashs de fin accidentels de la variable d'environnement
const RAW_URL = process.env.REACT_APP_API_URL || 'https://finance-api-2-fikd.onrender.com';
const API_URL = RAW_URL.replace(/\/+$/, ""); 

function App() {
  const [analyse, setAnalyse] = useState({ 
    solde_actuel: 0, recommandation: "Chargement...", total_revenus: 0, total_depenses: 0, dettes_a_recouvrer: 0 
  });
  const [transactions, setTransactions] = useState([]);
  const [dettes, setDettes] = useState([]);
  const [recherche, setRecherche] = useState("");

  // Récupération des données depuis le Backend Render
  const fetchData = useCallback(() => {
    // 1. Analyse financière (Route: /api/analyse/)
    axios.get(`${API_URL}/api/analyse/`)
      .then(res => setAnalyse(res.data))
      .catch(err => console.error("Erreur Analyse:", err));

    // 2. Historique des transactions (Route: /api/transactions/)
    axios.get(`${API_URL}/api/transactions/`)
      .then(res => setTransactions(res.data))
      .catch(err => console.error("Erreur Transactions:", err));

    // 3. Liste des dettes (Route: /api/dettes/)
    axios.get(`${API_URL}/api/dettes/`)
      .then(res => setDettes(res.data))
      .catch(err => console.error("Erreur Dettes:", err));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fonction pour marquer une dette comme payée
  const encaisserDette = (id) => {
    axios.patch(`${API_URL}/api/dettes/${id}/`, { est_paye: true })
      .then(() => {
        toast.success("💰 Paiement encaissé !");
        fetchData(); // Rafraîchit les chiffres et la liste
      })
      .catch((err) => {
        console.error("Erreur encaissement:", err);
        toast.error("Erreur lors de l'encaissement");
      });
  };

  const genererPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport de Gestion Financière", 14, 22);
    
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Description', 'Type', 'Montant (FCFA)']],
      body: transactions.map(t => [
        t.date_operation, 
        t.description || t.designation, 
        t.type, 
        parseFloat(t.montant).toLocaleString()
      ]),
      headStyles: { fillColor: [30, 41, 59] }
    });
    
    doc.save(`Rapport_Finance.pdf`);
    toast.success("Rapport PDF téléchargé !");
  };

  const transactionsFiltrees = transactions.filter(t => {
    const desc = t.description || t.designation || "";
    return desc.toLowerCase().includes(recherche.toLowerCase());
  });

  const dataGraph = [
    { name: 'Entrées', value: analyse.total_revenus || 0 },
    { name: 'Sorties', value: analyse.total_depenses || 0 }
  ];
  const COLORS = ['#27ae60', '#e74c3c'];

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px' }}>
      <Toaster position="top-right" />
      
      <div style={{ maxWidth: '1100px', margin: 'auto' }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ color: '#1a1a1a', margin: 0, fontWeight: '800' }}>TABLEAU DE BORD</h1>
            <p style={{ color: '#64748b', margin: 0 }}>Gestion en temps réel</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={genererPDF} style={btnPdfStyle}>📄 Rapport PDF</button>
          </div>
        </header>

        {/* CARTES ANALYTIQUES */}
        <section style={gridStyle}>
          <div style={cardStyle}>
            <span style={labelStyle}>Trésorerie Nette</span>
            <h2 style={{ color: '#2c3e50', margin: '10px 0' }}>{analyse.solde_actuel.toLocaleString()} FCFA</h2>
            <div style={notifStyle}>💡 {analyse.recommandation || "Analyse en cours..."}</div>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Créances Clients</span>
            <h2 style={{ color: '#f39c12', margin: '10px 0' }}>{analyse.dettes_a_recouvrer.toLocaleString()} FCFA</h2>
            <div style={badgeStyle}>À recouvrer</div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', padding: '10px' }}>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={dataGraph} innerRadius={30} outerRadius={40} dataKey="value" animationDuration={800}>
                  {dataGraph.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* FORMULAIRES D'AJOUT */}
        <section style={formGridStyle}>
          <AjoutTransaction onTransactionAdded={fetchData} />
          <AjoutDette onDetteAdded={fetchData} />
        </section>

        {/* LISTE DES DETTES */}
        <section style={{ ...cardStyle, marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>📋 Impayés à suivre</h3>
            <table style={tableStyle}>
                <thead>
                    <tr style={tableHeadStyle}>
                        <th style={{ padding: '12px' }}>Client</th>
                        <th>Montant</th>
                        <th>Échéance</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dettes.filter(d => !d.est_paye).map(dette => (
                        <tr key={dette.id} style={rowStyle}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{dette.client}</td>
                            <td>{parseFloat(dette.montant).toLocaleString()} FCFA</td>
                            <td>{dette.date_echeance}</td>
                            <td style={{ textAlign: 'right' }}>
                                <button onClick={() => encaisserDette(dette.id)} style={btnEncaisseStyle}>✅ Encaisser</button>
                            </td>
                        </tr>
                    ))}
                    {dettes.filter(d => !d.est_paye).length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Aucune dette en attente</td></tr>
                    )}
                </tbody>
            </table>
        </section>

        {/* HISTORIQUE DES OPÉRATIONS */}
        <section style={cardStyle}>
          <div style={tableHeaderStyle}>
            <h3 style={{ margin: 0 }}>Historique des Flux</h3>
            <input 
              placeholder="🔍 Rechercher une opération..." 
              style={searchStyle} 
              onChange={(e) => setRecherche(e.target.value)} 
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeadStyle}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th>Désignation</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {transactionsFiltrees.map(t => (
                  <tr key={t.id} style={rowStyle}>
                    <td style={{ padding: '12px' }}>{t.date_operation}</td>
                    <td style={{ fontWeight: '500' }}>{t.description || t.designation}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '0.75em', fontWeight: 'bold',
                        backgroundColor: t.type === 'REVENU' ? '#dcfce7' : '#fee2e2',
                        color: t.type === 'REVENU' ? '#15803d' : '#b91c1c'
                      }}>{t.type}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(t.montant).toLocaleString()} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- CONFIGURATION STYLES ---
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' };
const formGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' };
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.85em', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' };
const btnPdfStyle = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnEncaisseStyle = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const searchStyle = { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '280px', outline: 'none' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeadStyle = { textAlign: 'left', color: '#64748b', borderBottom: '2px solid #f1f5f9', fontSize: '0.9em' };
const tableHeaderStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' };
const rowStyle = { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' };
const badgeStyle = { display: 'inline-block', backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7em', fontWeight: '800' };
const notifStyle = { fontSize: '0.85em', color: '#059669', fontWeight: '500', marginTop: '5px' };

export default App;