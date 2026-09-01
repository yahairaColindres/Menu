import React, { useState, useEffect } from 'react';
import { getListaCompras, createItemCompra, updateItemCompra, deleteItemCompra, clearComprados, getCategorias, updateItemEstado, toggleNecesario } from '../services/api';
import Modal from './Modal';

const CATEGORY_ICONS = {
    'Carnes y Mariscos': '🥩',
    'Verduras y Frutas': '🥦',
    'Lácteos y Huevos': '🥛',
    'Bebidas': '🥤',
    'Limpieza e Higiene': '🧼',
    'Panadería y Cereales': '🍞',
    'Snacks': '🍿',
    'Carbohidratos': '🍚',
    'Especies y Condimentos': '🧂',
    'Belleza': '💅',
    'Bebé': '🍼',
    'Desechables': '🧻',
    'Medicina': '💊',
    'Repostería': '🧁',
    'Ensaladas': '🥗',
    'Plato Fuerte': '🍽️',
    'Postres': '🍰'
};

export default function ListaCompras() {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ nombre: '', cantidad: '', categoria_id: '', necesario: false });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [{ data: itemsData }, { data: catData }] = await Promise.all([
            getListaCompras(),
            getCategorias()
        ]);
        setItems(itemsData || []);
        setCategorias(catData || []);
    };

    const handleSetEstado = async (item, nuevoEstado, e) => {
        if (e) e.stopPropagation();
        setItems(prev => prev.map(i => i.id === item.id
            ? { ...i, estado: nuevoEstado, comprado: nuevoEstado === 'comprado' ? 1 : 0 }
            : i));
        try {
            await updateItemEstado(item.id, nuevoEstado);
        } catch { loadData(); }
    };

    const handleToggleNecesario = async (item, e) => {
        if (e) e.stopPropagation();
        const newVal = item.necesario ? 0 : 1;
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, necesario: newVal } : i));
        try {
            await toggleNecesario(item.id);
        } catch { loadData(); }
    };

    const handleToggleItem = async (item) => {
        const current = item.estado || (item.comprado ? 'comprado' : 'pendiente');
        const next = current === 'comprado' ? 'pendiente' : 'comprado';
        setItems(prev => prev.map(i => i.id === item.id
            ? { ...i, estado: next, comprado: next === 'comprado' ? 1 : 0 }
            : i));
        try {
            await updateItemEstado(item.id, next);
        } catch { loadData(); }
    };

    const handleOpenNew = () => {
        setEditingItem(null);
        setForm({ nombre: '', cantidad: '', categoria_id: categorias[0]?.id || '', necesario: false });
        setModalOpen(true);
    };

    const handleOpenEdit = (item, e) => {
        if (e) e.stopPropagation();
        setEditingItem(item);
        setForm({
            nombre: item.nombre || '',
            cantidad: item.cantidad || '',
            categoria_id: item.categoria_id || '',
            necesario: !!item.necesario
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.nombre.trim()) return;
        if (editingItem) {
            await updateItemCompra(editingItem.id, form);
        } else {
            await createItemCompra(form);
        }
        setModalOpen(false);
        loadData();
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm('¿Eliminar este producto?')) return;
        await deleteItemCompra(id);
        loadData();
    };

    const handleClearComprados = async () => {
        if (!window.confirm('¿Limpiar todos los productos comprados?')) return;
        await clearComprados();
        loadData();
    };

    // Filtrar por texto y categoría
    let filtered = items.filter(i => {
        if (!i.nombre.toLowerCase().includes(search.toLowerCase())) return false;
        if (selectedCategoryFilter && String(i.categoria_id) !== String(selectedCategoryFilter)) return false;
        return true;
    });

    // Separar en 4 grupos:
    // 1. COMPRAS: necesario=1 y NO comprado
    // 2. DISPONIBLE: comprado (verde)
    // 3. FALTANTE: pendiente y NO necesario (rojo)
    // 4. USADOS
    const comprasItems  = filtered.filter(i => i.necesario && i.estado !== 'comprado');
    const disponibles   = filtered.filter(i => i.estado === 'comprado');
    const faltantes     = filtered.filter(i => !i.necesario && i.estado === 'pendiente');
    const usadosItems   = filtered.filter(i => i.estado === 'usado');

    const groupByCategory = (itemList) => {
        const grouped = itemList.reduce((acc, item) => {
            const catName = item.categoria_nombre || 'Sin Categoría';
            if (!acc[catName]) acc[catName] = { color: item.categoria_color || '#888', items: [] };
            acc[catName].items.push(item);
            return acc;
        }, {});
        Object.values(grouped).forEach(g => g.items.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        return grouped;
    };

    const renderItems = (itemList, theme) => {
        const grouped = groupByCategory(itemList);
        return Object.entries(grouped).map(([catName, group]) => (
            <div key={catName} style={{ marginBottom: 16 }}>
                <h3 style={{
                    fontSize: '0.9rem', fontWeight: 700, color: '#311B92',
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: `2px solid ${group.color}33`,
                    paddingBottom: 4, marginBottom: 8
                }}>
                    <span style={{ background: group.color, width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }} />
                    {catName}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 'normal' }}>
                        ({group.items.length})
                    </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {group.items.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            theme={theme}
                            onToggle={handleToggleItem}
                            onSetEstado={handleSetEstado}
                            onToggleNecesario={handleToggleNecesario}
                            onEdit={handleOpenEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        ));
    };

    const countCompras   = items.filter(i => i.necesario && i.estado !== 'comprado').length;
    const countDisponible = items.filter(i => i.estado === 'comprado').length;
    const countFaltantes  = items.filter(i => !i.necesario && i.estado === 'pendiente').length;
    const countNecesarios = items.filter(i => i.necesario).length;

    return (
        <div>
            <div className="sticky-header-container">
                <div className="page-header">
                    <div>
                        <div className="page-title">🛒 Lista de Compras</div>
                        <div className="page-subtitle">
                            🌟 Necesarios: {countNecesarios} · 🟡 Comprar: {countCompras} · 🟢 Disponible: {countDisponible} · 🔴 Faltante: {countFaltantes}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenNew}>+ Agregar</button>
                </div>

                <div className="filter-bar" style={{ gap: 6 }}>
                    <input
                        className="input"
                        style={{ flex: 1, minWidth: 130 }}
                        placeholder="🔍 Buscar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>
                        Todos
                    </button>
                    <button className={`btn ${filter === 'compras' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('compras')}
                        style={{ background: filter === 'compras' ? '#F9A825' : '', borderColor: filter === 'compras' ? '#F9A825' : '' }}>
                        🛒 Comprar ({countCompras})
                    </button>
                    <button className={`btn ${filter === 'disponible' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('disponible')}>
                        🟢 Tengo ({countDisponible})
                    </button>
                    <button className={`btn ${filter === 'faltante' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('faltante')}>
                        🔴 Falta ({countFaltantes})
                    </button>
                    <select className="select" style={{ width: 'auto', minWidth: 140, fontSize: '0.82rem', padding: '6px 10px' }}
                        value={selectedCategoryFilter} onChange={e => setSelectedCategoryFilter(e.target.value)}>
                        <option value="">🏷️ Categoría</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                        ))}
                    </select>
                    {countDisponible > 0 && (
                        <button className="btn btn-secondary" style={{ fontSize: '0.78rem' }} onClick={handleClearComprados}>
                            🗑️ Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className="page-body">
                {/* ─── SECCIÓN COMPRAS (AMARILLO) ─── */}
                {(filter === 'all' || filter === 'compras') && comprasItems.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #FFF8E1, #FFE082)',
                            border: '2px solid #F9A825',
                            borderRadius: 14, padding: '12px 18px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.3rem' }}>🛒</span>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#E65100', fontFamily: 'var(--font-display)' }}>
                                    COMPRAS — Necesarios sin stock
                                </span>
                            </div>
                            <span style={{ background: '#FF8F00', color: '#fff', borderRadius: 20, padding: '3px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                                {comprasItems.length} {comprasItems.length === 1 ? 'producto' : 'productos'}
                            </span>
                        </div>
                        {renderItems(comprasItems, 'compras')}
                    </div>
                )}

                {/* ─── SECCIÓN DISPONIBLE (VERDE) ─── */}
                {(filter === 'all' || filter === 'disponible') && disponibles.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                            border: '2px solid #81C784',
                            borderRadius: 14, padding: '12px 18px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.3rem' }}>🏠</span>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1B5E20', fontFamily: 'var(--font-display)' }}>
                                    DISPONIBLE — Ya tengo en despensa
                                </span>
                            </div>
                            <span style={{ background: '#2E7D32', color: '#fff', borderRadius: 20, padding: '3px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                                {disponibles.length} {disponibles.length === 1 ? 'producto' : 'productos'}
                            </span>
                        </div>
                        {renderItems(disponibles, 'disponible')}
                    </div>
                )}

                {/* ─── SECCIÓN FALTANTE (ROJO) ─── */}
                {(filter === 'all' || filter === 'faltante') && faltantes.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
                            border: '2px solid #E57373',
                            borderRadius: 14, padding: '12px 18px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.3rem' }}>📋</span>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#B71C1C', fontFamily: 'var(--font-display)' }}>
                                    FALTANTE — No siempre necesario
                                </span>
                            </div>
                            <span style={{ background: '#C62828', color: '#fff', borderRadius: 20, padding: '3px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                                {faltantes.length} {faltantes.length === 1 ? 'producto' : 'productos'}
                            </span>
                        </div>
                        {renderItems(faltantes, 'faltante')}
                    </div>
                )}

                {/* ─── SECCIÓN USADOS ─── */}
                {(filter === 'all') && usadosItems.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
                            border: '2px solid #CE93D8',
                            borderRadius: 14, padding: '12px 18px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#6A1B9A', fontFamily: 'var(--font-display)' }}>
                                    USADOS EN RECETAS
                                </span>
                            </div>
                            <span style={{ background: '#7B1FA2', color: '#fff', borderRadius: 20, padding: '3px 14px', fontWeight: 700, fontSize: '0.82rem' }}>
                                {usadosItems.length}
                            </span>
                        </div>
                        {renderItems(usadosItems, 'usado')}
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-title">¡Sin productos!</div>
                            <div className="empty-desc">Agrega productos con el botón + Agregar</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Agregar/Editar */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? '✏️ Editar Producto' : '🛒 Agregar Producto'}
                onConfirm={handleSubmit}
            >
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Nombre del Producto</label>
                    <input
                        className="input"
                        placeholder="Ej: Espaguetis, Salsa, Aceite..."
                        value={form.nombre}
                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Cantidad (Opcional)</label>
                    <input
                        className="input"
                        placeholder="Ej: 2 lb, 1 caja, 3 unidades"
                        value={form.cantidad}
                        onChange={e => setForm({ ...form, cantidad: e.target.value })}
                    />
                </div>

                {/* Toggle NECESARIO */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: form.necesario ? '#FFF8E1' : '#F5F5F5',
                    border: `2px solid ${form.necesario ? '#F9A825' : '#E0E0E0'}`,
                    borderRadius: 12, padding: '12px 16px', marginBottom: 14,
                    cursor: 'pointer', transition: 'all 0.2s ease'
                }} onClick={() => setForm({ ...form, necesario: !form.necesario })}>
                    <span style={{ fontSize: '1.5rem' }}>{form.necesario ? '⭐' : '☆'}</span>
                    <div>
                        <div style={{ fontWeight: 700, color: form.necesario ? '#E65100' : '#757575' }}>
                            {form.necesario ? 'NECESARIO — Siempre comprar' : 'Marcar como NECESARIO'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9E9E9E' }}>
                            Los necesarios aparecen en la sección 🛒 COMPRAS cuando se acaban
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ marginBottom: 8 }}>Categoría</label>
                    <div className="category-grid">
                        {categorias.map(cat => {
                            const icon = CATEGORY_ICONS[cat.nombre] || '🏷️';
                            const isSelected = String(form.categoria_id) === String(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`category-grid-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => setForm({ ...form, categoria_id: cat.id })}
                                >
                                    <span className="category-grid-icon">{icon}</span>
                                    <span className="category-grid-name">{cat.nombre}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// ─── Sub-componente ItemCard ───────────────────────────────────────────────
function ItemCard({ item, theme, onToggle, onSetEstado, onToggleNecesario, onEdit, onDelete }) {
    const st = item.estado || (item.comprado ? 'comprado' : 'pendiente');
    const isNecesario = !!item.necesario;

    // Colores según el contexto
    const themes = {
        compras:    { bg: '#FFF8E1', border: '#FFB300', checkBg: '#FF8F00', checkColor: '#fff', icon: '🛒' },
        disponible: { bg: '#E8F5E9', border: '#81C784', checkBg: '#2E7D32', checkColor: '#fff', icon: '✓' },
        faltante:   { bg: '#FFEBEE', border: '#E57373', checkBg: '#FFCDD2', checkColor: '#B71C1C', icon: '✕' },
        usado:      { bg: '#F3E5F5', border: '#CE93D8', checkBg: '#CE93D8', checkColor: '#4A148C', icon: '⚡' },
    };
    const t = themes[theme] || themes.faltante;

    return (
        <div
            onClick={() => onToggle(item)}
            style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                background: t.bg, border: `1.5px solid ${t.border}`,
                transition: 'all 0.15s ease'
            }}
        >
            {/* Check box */}
            <div
                style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    background: t.checkBg, color: t.checkColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem'
                }}
                onClick={e => { e.stopPropagation(); onToggle(item); }}
            >
                {t.icon}
            </div>

            {/* Nombre + cantidad */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                    fontWeight: 600, fontSize: '0.92rem',
                    textDecoration: st === 'comprado' ? 'none' : 'none',
                    color: st === 'comprado' ? '#1B5E20' : st === 'usado' ? '#6A1B9A' : '#212121'
                }}>
                    {isNecesario && <span title="Necesario" style={{ marginRight: 4 }}>⭐</span>}
                    {item.nombre}
                </span>
                {item.cantidad && (
                    <span style={{ fontSize: '0.78rem', color: '#757575', marginLeft: 6 }}>
                        ({item.cantidad})
                    </span>
                )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 3, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                {/* Toggle NECESARIO */}
                <button
                    title={isNecesario ? 'Quitar de necesarios' : 'Marcar como necesario (siempre comprar)'}
                    onClick={e => onToggleNecesario(item, e)}
                    style={{
                        background: isNecesario ? '#FFF8E1' : 'transparent',
                        border: `1.5px solid ${isNecesario ? '#F9A825' : '#E0E0E0'}`,
                        borderRadius: 8, padding: '3px 7px', cursor: 'pointer',
                        fontSize: '0.82rem', transition: 'all 0.2s'
                    }}
                >
                    {isNecesario ? '⭐' : '☆'}
                </button>

                {/* Cambiar estado rápido */}
                <button
                    title="Marcar como Tengo"
                    onClick={e => onSetEstado(item, 'comprado', e)}
                    style={{
                        background: st === 'comprado' ? '#A5D6A7' : '#F5F5F5',
                        border: '1.5px solid #E0E0E0', borderRadius: 8,
                        padding: '3px 6px', cursor: 'pointer', fontSize: '0.75rem'
                    }}
                >🟢</button>

                <button
                    title="Marcar como Falta"
                    onClick={e => onSetEstado(item, 'pendiente', e)}
                    style={{
                        background: st === 'pendiente' ? '#FFCDD2' : '#F5F5F5',
                        border: '1.5px solid #E0E0E0', borderRadius: 8,
                        padding: '3px 6px', cursor: 'pointer', fontSize: '0.75rem'
                    }}
                >🔴</button>

                <button
                    title="Editar"
                    onClick={e => onEdit(item, e)}
                    style={{
                        background: '#F5F5F5', border: '1.5px solid #E0E0E0',
                        borderRadius: 8, padding: '3px 6px', cursor: 'pointer', fontSize: '0.75rem'
                    }}
                >✏️</button>

                <button
                    title="Eliminar"
                    onClick={e => onDelete(item.id, e)}
                    style={{
                        background: '#FFEBEE', border: '1.5px solid #FFCDD2',
                        borderRadius: 8, padding: '3px 6px', cursor: 'pointer', fontSize: '0.75rem'
                    }}
                >🗑️</button>
            </div>
        </div>
    );
}