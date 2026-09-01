import React, { useState, useEffect } from 'react';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../services/api';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', color: '#D81B60' });
    const [confirmOpen, setConfirmOpen] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        const { data } = await getCategorias();
        setCategorias(data);
    };

    const handleSubmit = async () => {
        if (editing) {
            await updateCategoria(editing.id, form);
        } else {
            await createCategoria(form);
        }
        setModalOpen(false);
        load();
        setEditing(null);
        setForm({ nombre: '', color: '#D81B60' });
    };

    const handleDelete = async (id) => {
        await deleteCategoria(id);
        load();
        setConfirmOpen(null);
    };
    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Categorías</div>
                    <div className="page-subtitle">Organiza tus recetas y compras por categoría</div>
                </div>
                {/* Botón de agregar categoría con logo/icono de un pollo 🍗 */}
                <button className="btn-primary" onClick={() => { setEditing(null); setForm({ nombre: '', color: '#D81B60' }); setModalOpen(true); }}>
                    🍗 + Agregar Categoría
                </button>
            </div>
            <div className="page-body">
                <div className="card" style={{ padding: '14px' }}>
                    {categorias.map(cat => (
                        <div key={cat.id} className="check-item" style={{ justifyContent: 'space-between', padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="cat-dot" style={{ background: cat.color, width: 14, height: 14 }}></span>
                                <span style={{ fontWeight: 600 }}>{cat.nombre}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn-ghost btn-sm" onClick={() => { setEditing(cat); setForm(cat); setModalOpen(true); }}>✏️ Editar</button>
                                <button className="btn-danger btn-sm" onClick={() => setConfirmOpen(cat.id)}>🗑️ Eliminar</button>
                            </div>
                        </div>
                    ))}
                    {categorias.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-title">🍗 Sin categorías</div>
                            <div className="empty-desc">Haz clic en 🍗 + Agregar Categoría para empezar</div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? '✏️ Editar categoría' : '🍗 Nueva Categoría'}
                onConfirm={handleSubmit}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', padding: '10px', borderRadius: '8px', marginBottom: 12 }}>
                    <span style={{ fontSize: '1.8rem' }}>🍗</span>
                    <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>Configuración de Categoría</strong>
                        <small style={{ color: 'var(--text-2)' }}>Asigna un nombre y color distintivo</small>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Nombre de la Categoría</label>
                    <input className="input" placeholder="ej: Carnes, Aves, Lácteos, Granos" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Color Distintivo</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="color" className="input" style={{ width: 60, height: 38, padding: 2, cursor: 'pointer' }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Selecciona un color para identificar tus productos</span>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog isOpen={confirmOpen !== null} onClose={() => setConfirmOpen(null)} onConfirm={() => handleDelete(confirmOpen)} title="Eliminar" message="¿Eliminar esta categoría?" />
        </div>
    );
}