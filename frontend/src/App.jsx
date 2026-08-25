import React, { useState } from 'react';
import ListaCompras from './components/ListaCompras';
import MenuSemanal from './components/MenuSemanal';
import Recetas from './components/Recetas';
import Categorias from './components/Categorias';

function App() {
    const [activeTab, setActiveTab] = useState('menu');
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'menu', label: 'Menú Semanal', icon: '📅' },
        { id: 'compras', label: 'Lista de Compras', icon: '🛒' },
        { id: 'recetas', label: 'Recetas', icon: '📖' },
        { id: 'categorias', label: 'Categorías', icon: '🏷️' },
    ];

    return (
        <div className="app-layout">
            <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h1>Menú + Compra</h1>
                    <p>Planifica · Cocina · Ahorra</p>
                </div>
                <div className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                        >
                            <span>{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <small>© 2025 · Tu cocina inteligente</small>
                </div>
            </div>
            <div className="main-content">
                <div className="mobile-toggle" style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
                    <button className="btn-icon" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
                    <span>{navItems.find(i => i.id === activeTab)?.label}</span>
                </div>
                {activeTab === 'menu' && <MenuSemanal />}
                {activeTab === 'compras' && <ListaCompras />}
                {activeTab === 'recetas' && <Recetas />}
                {activeTab === 'categorias' && <Categorias />}
            </div>
        </div>
    );
}

export default App;