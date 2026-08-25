import React, { useState, useEffect } from 'react';
import { getListaCompras, createItemCompra, updateItemCompra, deleteItemCompra, clearComprados, getCategorias, updateItemEstado } from '../services/api';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

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
    const [confirmOpen, setConfirmOpen] = useState(null);

    const [form, setForm] = useState({
        nombre: '',
        cantidad: '',
        categoria_id: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [{ data: itemsData }, { data: catData }] = await Promise.all([
            getListaCompras(),
            getCategorias()
        ]);
        setItems(itemsData || []);
        setCategorias(catData || []);
    };

    // Cambiar estado individual de un producto (🟢 Comprado / 🟡 Usado / 🔴 Pendiente)
    const handleSetEstado = async (item, nuevoEstado, e) => {
        if (e) e.stopPropagation();
        setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, estado: nuevoEstado, comprado: nuevoEstado === 'comprado' ? 1 : 0 } : i));
        try {
            await updateItemEstado(item.id, nuevoEstado);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            loadData();
        }
    };

    // Al hacer clic en la tarjeta: alternar estado
    const handleToggleItem = async (item) => {
        const current = item.estado || (item.comprado ? 'comprado' : 'pendiente');
        let next = 'comprado';
        if (current === 'comprado') {
            next = 'pendiente';
        } else if (current === 'pendiente') {
            next = 'comprado';
        } else if (current === 'usado') {
            next = 'comprado';
        }
        setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, estado: next, comprado: next === 'comprado' ? 1 : 0 } : i));
        try {
            await updateItemEstado(item.id, next);
        } catch (error) {
            console.error('Error al alternar estado:', error);
            loadData();
        }
    };

    const handleOpenNew = () => {
        setEditingItem(null);
        setForm({
            nombre: '',
            cantidad: '',
            categoria_id: categorias[0]?.id || ''
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (item, e) => {
        if (e) e.stopPropagation();
        setEditingItem(item);
        setForm({
            nombre: item.nombre || '',
            cantidad: item.cantidad || '',
            categoria_id: item.categoria_id || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        if (editingItem) {
            await updateItemCompra(editingItem.id, form);
        } else {
            await createItemCompra(form);
        }
        setModalOpen(false);
        loadData();
    };

    const handleDelete = async (id) => {
        await deleteItemCompra(id);
        loadData();
    };

    const handleClearComprados = async () => {
        await clearComprados();
        loadData();
    };

    // Conteo por estado
    const countNoTengo = items.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'pendiente').length;
    const countTengo = items.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'comprado').length;
    const countUsados = items.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'usado').length;

    // Filtrar por texto y categoría seleccionada
    let filtered = items.filter(i => {
        const matchesSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (selectedCategoryFilter && String(i.categoria_id) !== String(selectedCategoryFilter)) return false;
        return true;
    });

    // Separar en 3 grupos por estado
    const noTengoItems = filtered.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'pendiente');
    const tengoItems = filtered.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'comprado');
    const usadosItems = filtered.filter(i => (i.estado || (i.comprado ? 'comprado' : 'pendiente')) === 'usado');

    // Función auxiliar para agrupar ítems por Categoría y ordenar alfabéticamente
    const groupByCategory = (itemList) => {
        const grouped = itemList.reduce((acc, item) => {
            const catName = item.categoria_nombre || 'Sin Categoría';
            if (!acc[catName]) {
                acc[catName] = {
                    color: item.categoria_color || '#888',
                    items: []
                };
            }
            acc[catName].items.push(item);
            return acc;
        }, {});

        Object.keys(grouped).forEach(catName => {
            grouped[catName].items.sort((a, b) => a.nombre.localeCompare(b.nombre));
        });
        return grouped;
    };

    const groupedNoTengo = groupByCategory(noTengoItems);
    const groupedTengo = groupByCategory(tengoItems);
    const groupedUsados = groupByCategory(usadosItems);

    // Componente para renderizar una lista agrupada por categoría
    const renderCategoryGroups = (groupedData) => {
        return Object.entries(groupedData).map(([catName, group]) => (
            <div key={catName} className="category-group" style={{ marginBottom: 16 }}>
                <h3 className="category-group-title">
                    <span className="cat-dot" style={{ background: group.color, width: 14, height: 14, borderRadius: '50%' }}></span>
                    <span>{catName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 'normal', marginLeft: 6 }}>
                        ({group.items.length} {group.items.length === 1 ? 'producto' : 'productos'})
                    </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {group.items.map(item => {
                        const st = item.estado || (item.comprado ? 'comprado' : 'pendiente');
                        let cardClass = 'item-pendiente';
                        let boxClass = 'box-pendiente';
                        let titleClass = 'title-pendiente';
                        let boxIcon = '✕';

                        if (st === 'comprado') {
                            cardClass = 'item-comprado';
                            boxClass = 'box-comprado';
                            titleClass = 'title-comprado';
                            boxIcon = '✓';
                        } else if (st === 'usado') {
                            cardClass = 'item-usado';
                            boxClass = 'box-usado';
                            titleClass = 'title-usado';
                            boxIcon = '⚡';
                        }

                        return (
                            <div 
                                key={item.id} 
                                className={`shopping-item-card ${cardClass}`}
                                onClick={() => handleToggleItem(item)}
                                style={{ cursor: 'pointer' }}
                                title="Haz clic para cambiar el estado"
                            >
                                <div 
                                    className={`checkmark-box ${boxClass}`}
                                    onClick={(e) => { e.stopPropagation(); handleToggleItem(item); }}
                                >
                                    {boxIcon}
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span className={`item-title ${titleClass}`}>
                                        {item.nombre}
                                    </span>

                                    {item.cantidad && (
                                        <span className="item-qty-badge">
                                            ({item.cantidad})
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        className="btn-ghost btn-sm" 
                                        style={{ 
                                            padding: '2px 8px', 
                                            fontSize: '0.72rem', 
                                            fontWeight: '700', 
                                            background: st === 'comprado' ? '#A5D6A7' : '#E0E0E0', 
                                            color: st === 'comprado' ? '#1B5E20' : '#424242',
                                            borderRadius: '12px'
                                        }}
                                        onClick={(e) => handleSetEstado(item, 'comprado', e)}
                                        title="Marcar como Tengo / Comprado"
                                    >
                                        🟢 Tengo
                                    </button>

                                    <button 
                                        className="btn-ghost btn-sm" 
                                        style={{ 
                                            padding: '2px 8px', 
                                            fontSize: '0.72rem', 
                                            fontWeight: '700', 
                                            background: st === 'usado' ? '#FFF59D' : '#E0E0E0', 
                                            color: st === 'usado' ? '#E65100' : '#424242',
                                            borderRadius: '12px'
                                        }}
                                        onClick={(e) => handleSetEstado(item, 'usado', e)}
                                        title="Marcar como Usado en receta"
                                    >
                                        🟡 Usado
                                    </button>

                                    <button 
                                        className="btn-ghost btn-sm" 
                                        style={{ 
                                            padding: '2px 8px', 
                                            fontSize: '0.72rem', 
                                            fontWeight: '700', 
                                            background: st === 'pendiente' ? '#FFCDD2' : '#E0E0E0', 
                                            color: st === 'pendiente' ? '#B71C1C' : '#424242',
                                            borderRadius: '12px'
                                        }}
                                        onClick={(e) => handleSetEstado(item, 'pendiente', e)}
                                        title="Marcar como No tengo (Pendiente)"
                                    >
                                        🔴 No tengo
                                    </button>

                                    <button 
                                        className="btn-ghost btn-sm" 
                                        onClick={(e) => handleOpenEdit(item, e)}
                                        title="Editar producto"
                                    >
                                        ✏️
                                    </button>
                                    
                                    <button 
                                        className="btn-danger btn-sm" 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        title="Eliminar producto"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ));
    };

    const hasNoItems = filtered.length === 0;

    return (
        <div>
            <div className="sticky-header-container">
                <div className="page-header">
                    <div>
                        <div className="page-title">Lista de Compras</div>
                        <div className="page-subtitle">Organizado claramente entre lo que necesitas comprar (🔴 No tengo) y lo que tienes en despensa (🟢 Tengo)</div>
                    </div>
                    <button className="btn-primary" onClick={handleOpenNew}>
                        🛒 + Añadir ítem
                    </button>
                </div>

                <div className="filter-bar" style={{ gap: 8 }}>
                    <div className="search-wrap" style={{ flex: 1, minWidth: '180px' }}>
                        <span className="search-icon">🔍</span>
                        <input 
                            className="input" 
                            placeholder="Buscar producto en la lista..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>

                    <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>
                        Todos ({items.length})
                    </button>
                    <button className={`btn ${filter === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('pendientes')}>
                        🔴 Por Comprar ({countNoTengo})
                    </button>
                    <button className={`btn ${filter === 'comprados' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('comprados')}>
                        🟢 En Despensa ({countTengo})
                    </button>
                    {countUsados > 0 && (
                        <button className={`btn ${filter === 'usados' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('usados')}>
                            🟡 Usados ({countUsados})
                        </button>
                    )}
                    
                    <select 
                        className="select" 
                        style={{ width: 'auto', minWidth: '160px', padding: '6px 12px', fontSize: '0.85rem' }} 
                        value={selectedCategoryFilter} 
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                    >
                        <option value="">🏷️ Todas las Categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                        ))}
                    </select>

                    {countTengo > 0 && (
                        <button className="btn-danger btn-sm" onClick={handleClearComprados}>
                            🗑️ Limpiar comprados
                        </button>
                    )}
                </div>
            </div>

            <div className="page-body">
                {hasNoItems ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-title">¡Sin productos en esta vista!</div>
                            <div className="empty-desc">Agrega productos con el botón 🛒 + Añadir ítem</div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* SECCIÓN 1: NO TENGO / POR COMPRAR */}
                        {(filter === 'all' || filter === 'pendientes') && noTengoItems.length > 0 && (
                            <div className="status-section">
                                <div className="status-section-header notengo">
                                    <div className="status-section-title">
                                        <span>🛒 🔴 POR COMPRAR (NO TENGO)</span>
                                    </div>
                                    <span className="status-section-badge">
                                        {noTengoItems.length} {noTengoItems.length === 1 ? 'producto pendiente' : 'productos pendientes'}
                                    </span>
                                </div>
                                {renderCategoryGroups(groupedNoTengo)}
                            </div>
                        )}

                        {/* SECCIÓN 2: YA TENGO / EN DESPENSA */}
                        {(filter === 'all' || filter === 'comprados') && tengoItems.length > 0 && (
                            <div className="status-section">
                                <div className="status-section-header tengo">
                                    <div className="status-section-title">
                                        <span>🏠 🟢 YA TENGO EN DESPENSA (COMPRADOS)</span>
                                    </div>
                                    <span className="status-section-badge">
                                        {tengoItems.length} {tengoItems.length === 1 ? 'producto disponible' : 'productos disponibles'}
                                    </span>
                                </div>
                                {renderCategoryGroups(groupedTengo)}
                            </div>
                        )}

                        {/* SECCIÓN 3: USADOS */}
                        {(filter === 'all' || filter === 'usados') && usadosItems.length > 0 && (
                            <div className="status-section">
                                <div className="status-section-header usados">
                                    <div className="status-section-title">
                                        <span>⚡ 🟡 USADOS EN RECETAS</span>
                                    </div>
                                    <span className="status-section-badge">
                                        {usadosItems.length} {usadosItems.length === 1 ? 'producto' : 'productos'}
                                    </span>
                                </div>
                                {renderCategoryGroups(groupedUsados)}
                            </div>
                        )}
                    </>
                )}
            </div>



            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editingItem ? '✏️ Editar Ingrediente' : '🛒 Agregar Ingrediente'}
                onConfirm={handleSubmit}
            >
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Nombre del Producto / Alimento</label>
                    <input 
                        className="input" 
                        placeholder="Ej: Repollo, Frijoles, Pollo, Huevos..." 
                        value={form.nombre} 
                        onChange={e => setForm({ ...form, nombre: e.target.value })} 
                    />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Cantidad / Presentación (Opcional)</label>
                    <input 
                        className="input" 
                        placeholder="Ej: 2 lb, 1 kg, 1 cartón, 3 unidades" 
                        value={form.cantidad} 
                        onChange={e => setForm({ ...form, cantidad: e.target.value })} 
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" style={{ marginBottom: 8 }}>Categoría del Alimento</label>
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
                                    style={{
                                        '--cat-color': cat.color || '#ec4899'
                                    }}
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