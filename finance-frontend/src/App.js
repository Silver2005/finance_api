import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AjoutTransaction from './components/AjoutTransaction';
import AjoutDette from './components/AjoutDette';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toaster, toast } from 'react-hot-toast';

// Définition de l'URL de l'API (Dynamique)
const API_URL = process.env.REACT_APP_API_URL || 'https://finance-api-2-fikd.onrender.com';

function App() {
  const [analyse, setAnalyse] = useState({ 
    solde_actuel: 0, recommandation: "", total_revenus: 0, total_depenses: 0, dettes_a_recouvrer: 0 
  });
  const [transactions, setTransactions] = useState([]);
  const [dettes, setDettes] = useState([]);
  const [recherche, setRecherche] = useState("");

  const fetchData = useCallback(() => {
    // Utilisation de `${API_URL}/...` au lieu de l'adresse en dur
    axios.get(`${API_URL}/analyse/`)
      .then(res => setAnalyse(res.data))
      .catch(err => console.error("Erreur Analyse:", err));

    axios.get(`${API_URL}/transactions/`)
      .then(res => setTransactions(res.data));

    axios.get(`${API_URL}/dettes/`)
      .then(res => setDettes(res.data));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const encaisserDette = (id) => {
    axios.patch(`${API_URL}/dettes/${id}/`, { est_paye: true })
      .then(() => {
        toast.success("💰 Paiement encaissé !");
        fetchData();
      })
      .catch(() => toast.error("Erreur lors de l'encaissement"));
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
            <p style={{ color: '#64748b', margin: 0 }}></p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={genererPDF} style={btnPdfStyle}>📄 IMPRIMER UN Rapport</button>
          </div>
        </header>

        {/* CARTES ANALYTIQUES */}
        <section style={gridStyle}>
          <div style={cardStyle}>
            <span style={labelStyle}>Trésorerie Nette</span>
            <h2 style={{ color: '#2c3e50', margin: '10px 0' }}>{analyse.solde_actuel.toLocaleString()} FCFA</h2>
            <div style={notifStyle}>💡 {analyse.recommandation}</div>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Créances Clients</span>
            <h2 style={{ color: '#f39c12', margin: '10px 0' }}>{analyse.dettes_a_recouvrer.toLocaleString()} FCFA</h2>
            <div style={badgeStyle}>En attente</div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', padding: '10px' }}>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={dataGraph} innerRadius={30} outerRadius={40} dataKey="value">
                  {dataGraph.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* FORMULAIRES */}
        <section style={formGridStyle}>
          <AjoutTransaction onTransactionAdded={fetchData} />
          <AjoutDette onDetteAdded={fetchData} />
        </section>

        {/* TABLEAU DES CRÉANCES */}
        <section style={{ ...cardStyle, marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>📋 Paiements en attente</h3>
            <table style={tableStyle}>
                <thead>
                    <tr style={tableHeadStyle}>
                        <th>Client</th>
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
                </tbody>
            </table>
        </section>

        {/* JOURNAL GÉNÉRAL */}
        <section style={cardStyle}>
          <div style={tableHeaderStyle}>
            <h3 style={{ margin: 0 }}>Journal des Opérations</h3>
            <input placeholder="🔍 Filtrer..." style={searchStyle} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadStyle}>
                <th>Date</th>
                <th>Désignation</th>
                <th>Flux</th>
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
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em',
                      backgroundColor: t.type === 'REVENU' ? '#eafaf1' : '#fdedec',
                      color: t.type === 'REVENU' ? '#27ae60' : '#e74c3c'
                    }}>{t.type}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(t.montant).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

// STYLES (Conservés)
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' };
const cardStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const labelStyle = { color: '#64748b', fontSize: '0.9em', fontWeight: '600', textTransform: 'uppercase' };
const btnPdfStyle = { backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const btnEncaisseStyle = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75em' };
const searchStyle = { padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '250px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeadStyle = { textAlign: 'left', color: '#7f8c8d', borderBottom: '1px solid #eee' };
const tableHeaderStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' };
const rowStyle = { borderBottom: '1px solid #f1f5f9' };
const badgeStyle = { display: 'inline-block', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold' };
const notifStyle = { fontSize: '0.85em', color: '#16a085', fontWeight: '600' };

export default App;