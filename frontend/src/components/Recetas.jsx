import React, { useState, useEffect } from 'react';
import { getRecetas, deleteReceta, getCategorias, createReceta, updateReceta, getListaCompras } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';

const PRESET_FOOD_PHOTOS = [
    { label: '🍗 Pollo', url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80' },
    { label: '🥩 Carne', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
    { label: '🍳 Huevos', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
    { label: '🥞 Panqueques', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80' },
    { label: '🌮 Baleadas/Tacos', url: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80' },
    { label: '🥗 Ensalada', url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
    { label: '🍰 Postre', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
    { label: '🍼 Bebé', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' }
];

export default function Recetas({ onSelectReceta, seleccionModo = false }) {
    const [recetas, setRecetas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [listaComprasItems, setListaComprasItems] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(null);
    const [detalleOpen, setDetalleOpen] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        nombre: '',
        tiempo: '',
        instrucciones: '',
        imagen: '',
        categoria_id: '',
        ingredientes: []
    });

    useEffect(() => { 
        load(); 
        loadCats(); 
        loadCompras();
    }, []);

    const load = async () => { 
        const { data } = await getRecetas(); 
        setRecetas(data || []); 
    };

    const loadCats = async () => { 
        const { data } = await getCategorias(); 
        setCategorias(data || []); 
    };

    const loadCompras = async () => { 
        const { data } = await getListaCompras(); 
        setListaComprasItems(data || []); 
    };

    const handleDelete = async () => { 
        await deleteReceta(confirmOpen); 
        load(); 
        setConfirmOpen(null); 
    };

    const handleNew = () => {
        setEditing(null);
        setForm({
            nombre: '',
            tiempo: '',
            instrucciones: '',
            imagen: '',
            categoria_id: '',
            ingredientes: []
        });
        setFormOpen(true);
    };

    const handleEdit = (receta, e) => {
        if (e) e.stopPropagation();
        setEditing(receta);
        setForm({
            nombre: receta.nombre || '',
            tiempo: receta.tiempo || '',
            instrucciones: receta.instrucciones || '',
            imagen: receta.imagen || '',
            categoria_id: receta.categoria_id || '',
            ingredientes: receta.ingredientes || []
        });
        setFormOpen(true);
    };

    const addFormIngredient = () => {
        setForm({
            ...form,
            ingredientes: [...form.ingredientes, { nombre: '', cantidad: '' }]
        });
    };

    const updateFormIngredient = (index, field, value) => {
        const list = [...form.ingredientes];
        list[index][field] = value;
        setForm({ ...form, ingredientes: list });
    };

    const removeFormIngredient = (index) => {
        const list = form.ingredientes.filter((_, i) => i !== index);
        setForm({ ...form, ingredientes: list });
    };

    // Subir imagen desde la computadora/celular
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, imagen: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (editing) {
            await updateReceta(editing.id, form);
        } else {
            await createReceta(form);
        }
        setFormOpen(false);
        load();
    };

    const handleCardClick = (receta) => {
        if (seleccionModo) {
            if (onSelectReceta) {
                onSelectReceta(receta);
            }
        } else {
            setDetalleOpen(receta);
        }
    };

    const filtered = recetas.filter(r => r.nombre.toLowerCase().includes(search.toLowerCase()));
    const getCatObj = (catId) => categorias.find(c => String(c.id) === String(catId));

    const mainSectionsOrder = ['Plato Fuerte', 'Complemento', 'Ensaladas', 'Menú Bebé', 'Postres'];

    const groupedRecetas = filtered.reduce((acc, receta) => {
        const catObj = getCatObj(receta.categoria_id);
        const catName = catObj ? catObj.nombre : 'Otras Comidas';
        if (!acc[catName]) {
            acc[catName] = {
                catObj,
                items: []
            };
        }
        acc[catName].items.push(receta);
        return acc;
    }, {});

    const sortedGroupEntries = Object.entries(groupedRecetas).sort(([aKey], [bKey]) => {
        let idxA = mainSectionsOrder.indexOf(aKey);
        let idxB = mainSectionsOrder.indexOf(bKey);
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        if (idxA !== idxB) return idxA - idxB;
        return aKey.localeCompare(bKey);
    });

    return (
        <div>
            <div className="sticky-header-container">
                {!seleccionModo && (
                    <div className="page-header">
                        <div>
                            <div className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Mis Recetas</div>
                            <div className="page-subtitle">1º Plato Fuerte · 2º Complemento · 3º Ensaladas · 4º Menú Bebé · 5º Postres</div>
                        </div>
                        <button className="btn-primary" onClick={handleNew}>🍽️ + Nueva receta</button>
                    </div>
                )}

                {seleccionModo && (
                    <div style={{ background: '#E8F5E9', borderBottom: '1.5px solid #81C784', padding: '12px 16px', color: '#1B5E20', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center' }}>
                        👇 Haz clic en la foto o tarjeta de cualquier comida para seleccionarla
                    </div>
                )}
                
                <div className="filter-bar">
                    <div className="search-wrap" style={{ flex: 1 }}>
                        <span className="search-icon">🔍</span>
                        <input 
                            className="input" 
                            placeholder="Buscar receta (ej: Huevos, Baleadas, Pollo, Ensalada)..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            <div className="page-body">
                {sortedGroupEntries.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-title">Sin recetas encontradas</div>
                        </div>
                    </div>
                ) : (
                    sortedGroupEntries.map(([catName, group]) => (
                        <div key={catName} style={{ marginBottom: 28 }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.3rem',
                                fontWeight: 800,
                                color: group.catObj ? group.catObj.color : '#1A1714',
                                borderBottom: group.catObj ? `2.5px solid ${group.catObj.color}` : '2.5px solid var(--border)',
                                paddingBottom: 6,
                                marginBottom: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <span>{catName}</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 'normal', color: 'var(--text-3)' }}>
                                    ({group.items.length} disponibles)
                                </span>
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                                {group.items.map(receta => (
                                    <div 
                                        key={receta.id} 
                                        className="recipe-card" 
                                        onClick={() => handleCardClick(receta)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            border: seleccionModo ? '2.5px solid var(--accent)' : '1px solid var(--border)',
                                            borderRadius: 14,
                                            overflow: 'hidden',
                                            background: '#FFFFFF',
                                            boxShadow: '0 4px 14px rgba(0,0,0,0.07)',
                                            transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            {receta.imagen ? (
                                                <img 
                                                    src={receta.imagen} 
                                                    className="recipe-img" 
                                                    alt={receta.nombre} 
                                                    style={{ height: 145, width: '100%', objectFit: 'cover', display: 'block' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
                                                    }}
                                                />
                                            ) : (
                                                <div className="recipe-img-placeholder" style={{ height: 145, fontSize: '2.4rem' }}>🍽️</div>
                                            )}

                                            {seleccionModo && (
                                                <div className="recipe-select-overlay">
                                                    👉 Clic para seleccionar
                                                </div>
                                            )}
                                        </div>

                                        <div className="recipe-card-body" style={{ padding: 12 }}>
                                            <div className="recipe-card-title" style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.35, color: '#1A1714' }}>
                                                {receta.nombre}
                                            </div>
                                            {receta.tiempo && <small className="page-subtitle" style={{ fontSize: '0.75rem', marginTop: 4 }}>⏱️ {receta.tiempo}</small>}
                                            
                                            {!seleccionModo && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                                    <button className="btn-secondary btn-sm" onClick={(e) => handleEdit(receta, e)}>✏️ Editar</button>
                                                    <button className="btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setConfirmOpen(receta.id); }}>🗑️ Eliminar</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog isOpen={confirmOpen !== null} onClose={() => setConfirmOpen(null)} onConfirm={handleDelete} title="Eliminar receta" message="¿Estás seguro?" />

            <Modal isOpen={detalleOpen !== null} onClose={() => setDetalleOpen(null)} title={detalleOpen?.nombre}>
                {detalleOpen && (
                    <div>
                        {detalleOpen.imagen && (
                            <img 
                                src={detalleOpen.imagen} 
                                className="recipe-detail-img" 
                                alt="" 
                                style={{ marginBottom: 12, height: 240, width: '100%', objectFit: 'cover', borderRadius: 14 }} 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                        )}
                        
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            <button className="btn-secondary btn-sm" onClick={(e) => { const r = detalleOpen; setDetalleOpen(null); handleEdit(r, e); }}>✏️ Editar Receta</button>
                            <button className="btn-danger btn-sm" onClick={() => { setConfirmOpen(detalleOpen.id); setDetalleOpen(null); }}>🗑️ Eliminar</button>
                        </div>

                        <div style={{ marginBottom: 8 }}><strong>🏷️ Categoría:</strong> {getCatObj(detalleOpen.categoria_id)?.nombre || 'Sin Categoría'}</div>
                        <div style={{ marginBottom: 12 }}><strong>⏱️ Tiempo:</strong> {detalleOpen.tiempo || 'No especificado'}</div>
                        <div style={{ marginBottom: 12 }}><strong>📝 Instrucciones:</strong> <p style={{ whiteSpace: 'pre-line', marginTop: 4 }}>{detalleOpen.instrucciones || 'Sin instrucciones'}</p></div>
                        <div style={{ marginBottom: 8 }}><strong>🥕 Ingredientes:</strong></div>
                        <ul style={{ paddingLeft: 20 }}>
                            {detalleOpen.ingredientes?.map((ing, i) => <li key={i}>{ing.nombre} {ing.cantidad && `(${ing.cantidad})`}</li>)}
                        </ul>
                    </div>
                )}
            </Modal>

            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? '✏️ Editar receta' : '🍽️ Nueva receta'} onConfirm={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Nombre de la Receta</label>
                    <input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Tiempo (ej: 30 min)</label>
                        <input className="input" value={form.tiempo} onChange={e => setForm({ ...form, tiempo: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Categoría de la Comida</label>
                        <select 
                            className="select" 
                            value={form.categoria_id !== null && form.categoria_id !== undefined ? String(form.categoria_id) : ''} 
                            onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                        >
                            <option value="">Sin Categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sección de Imagen: Permite pegar un link, subir desde la computadora/celular o elegir fotos preestablecidas */}
                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Imagen de la Receta</label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input 
                            className="input" 
                            placeholder="Pegar link de Internet (https://...)" 
                            value={form.imagen} 
                            onChange={e => setForm({ ...form, imagen: e.target.value })} 
                            onDoubleClick={e => e.target.select()}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label className="btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                📁 Subir foto desde dispositivo
                                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                            {form.imagen && (
                                <button type="button" className="btn-danger btn-sm" onClick={() => setForm({ ...form, imagen: '' })}>
                                    🗑️ Quitar foto
                                </button>
                            )}
                        </div>

                        <div>
                            <small className="page-subtitle" style={{ display: 'block', marginBottom: 6 }}>O elige una foto rápida de muestra:</small>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {PRESET_FOOD_PHOTOS.map((p, idx) => (
                                    <button 
                                        key={idx} 
                                        type="button" 
                                        className="btn-ghost btn-sm" 
                                        style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#F5F5F5', borderRadius: '12px' }}
                                        onClick={() => setForm({ ...form, imagen: p.url })}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.imagen && (
                            <div style={{ marginTop: 8 }}>
                                <small className="page-subtitle" style={{ display: 'block', marginBottom: 4 }}>Vista previa de la foto:</small>
                                <img 
                                    src={form.imagen} 
                                    alt="Vista previa" 
                                    style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} 
                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Instrucciones</label>
                    <textarea className="textarea" value={form.instrucciones} onChange={e => setForm({ ...form, instrucciones: e.target.value })} />
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label className="form-label" style={{ margin: 0 }}>🥕 Ingredientes</label>
                        <button type="button" className="btn-secondary btn-sm" onClick={addFormIngredient}>+ Añadir ingrediente</button>
                    </div>
                    
                    <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                        {form.ingredientes.map((ing, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                <input 
                                    className="input" 
                                    list="productos-compras-list"
                                    placeholder="Nombre del producto / ingrediente" 
                                    value={ing.nombre} 
                                    onChange={e => updateFormIngredient(index, 'nombre', e.target.value)} 
                                />
                                <input className="input" placeholder="Cant." value={ing.cantidad} onChange={e => updateFormIngredient(index, 'cantidad', e.target.value)} />
                                <button type="button" className="btn-danger btn-sm" onClick={() => removeFormIngredient(index)}>🗑️</button>
                            </div>
                        ))}
                        {form.ingredientes.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '12px 0' }}>No se han añadido ingredientes</div>}
                    </div>

                    <datalist id="productos-compras-list">
                        {listaComprasItems.map(item => (
                            <option key={item.id} value={item.nombre} />
                        ))}
                    </datalist>
                </div>
            </Modal>
        </div>
    );
}