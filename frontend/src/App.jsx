import React, { useState } from 'react';
import ListaCompras from './components/ListaCompras';
import MenuSemanal from './components/MenuSemanal';
import Recetas from './components/Recetas';
import Categorias from './components/Categorias';

function App() {
    const [activeTab, setActiveTab] = useState('menu');
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { id: 'menu',      label: 'Menú',      icon: '📅' },
        { id: 'compras',   label: 'Compras',   icon: '🛒' },
        { id: 'recetas',   label: 'Recetas',   icon: '📖' },
        { id: 'categorias',label: 'Categorías',icon: '🏷️' },
    ];

    const handleNav = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    return (
        <div className="app-layout">
            {/* Overlay oscuro cuando sidebar está abierto en móvil */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (desktop siempre visible, móvil deslizable) */}
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
                            onClick={() => handleNav(item.id)}
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

            {/* Contenido principal */}
            <div className="main-content">
                {activeTab === 'menu'       && <MenuSemanal />}
                {activeTab === 'compras'    && <ListaCompras />}
                {activeTab === 'recetas'    && <Recetas />}
                {activeTab === 'categorias' && <Categorias />}
            </div>

            {/* Bottom Navigation Bar — solo visible en móvil (CSS la muestra/oculta) */}
            <nav className="bottom-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => handleNav(item.id)}
                        aria-label={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="bottom-nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default App;