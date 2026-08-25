import React, { useState, useEffect } from 'react';
import { getMenuDiario, setMenuDiario, deleteMenuDiario, clearMenuDay, useIngredientes } from '../services/api';
import Recetas from './Recetas';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

// Formato de fecha YYYY-MM-DD en hora local
const formatDateLocal = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const dayColors = [
    { bg: '#FAFAFD', headerBg: '#FFE5E9', border: '#FF8A9B', text: '#D81B60', pill: '#FFF0F2' }, // Lunes
    { bg: '#FAFAF8', headerBg: '#FFE8D6', border: '#FFB074', text: '#E65100', pill: '#FFF3E8' }, // Martes
    { bg: '#FAFBF5', headerBg: '#FFF9C4', border: '#FBC02D', text: '#9E9D24', pill: '#FFFDE7' }, // Miércoles
    { bg: '#F6FBF7', headerBg: '#DCEDC8', border: '#81C784', text: '#2E7D32', pill: '#E8F5E9' }, // Jueves
    { bg: '#F5FCFD', headerBg: '#E0F7FA', border: '#4DD0E1', text: '#00838F', pill: '#E0F2F1' }, // Viernes
    { bg: '#F6FAFF', headerBg: '#E3F2FD', border: '#64B5F6', text: '#1565C0', pill: '#E3F2FD' }, // Sábado
    { bg: '#FAF6FF', headerBg: '#F3E5F5', border: '#BA68C8', text: '#6A1B9A', pill: '#F3E5F5' }  // Domingo
];

// Foto por defecto cuando aún no se ha elegido ninguna comida
const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80";

export default function MenuSemanal() {
    const [semana, setSemana] = useState(0);
    const [menu, setMenu] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(null);
    const [clearDate, setClearDate] = useState(null);

    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1) + semana * 7);
    const dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        return d;
    });

    const loadMenu = async () => {
        try {
            const start = formatDateLocal(dias[0]);
            const end = formatDateLocal(dias[6]);
            const { data } = await getMenuDiario({ start, end });
            setMenu(data || {});
        } catch (e) {
            console.error("Error al cargar menú:", e);
        }
    };

    useEffect(() => { loadMenu(); }, [semana]);

    const handleAddReceta = async (receta) => {
        if (!receta || !receta.id) return;
        
        // 1. Cerrar el modal al instante
        setModalOpen(false);

        // 2. Reemplazar la comida del mismo tipo en la tarjeta al instante
        const esBebe = (receta.categoria_nombre || '').toLowerCase().includes('bebé');
        const newItem = {
            id: Date.now(),
            fecha: selectedDate,
            receta_id: receta.id,
            receta_nombre: receta.nombre,
            imagen: receta.imagen || DEFAULT_FOOD_IMAGE,
            tiempo: receta.tiempo,
            categoria_nombre: receta.categoria_nombre || 'Comida'
        };

        setMenu(prev => {
            const existingList = prev[selectedDate] ? [...prev[selectedDate]] : [];
            // Quitar las entradas del mismo tipo (principal o bebé) y mantener las del otro tipo
            const filtered = existingList.filter(item => {
                const itemEsBebe = (item.categoria_nombre || '').toLowerCase().includes('bebé');
                return esBebe ? !itemEsBebe : itemEsBebe;
            });
            return {
                ...prev,
                [selectedDate]: [...filtered, newItem]
            };
        });

        // 3. Guardar en backend y sincronizar sus ingredientes en la lista de compras (Pendiente/Usado)
        try {
            await setMenuDiario({ fecha: selectedDate, receta_id: receta.id });
            if (receta.ingredientes && receta.ingredientes.length) {
                await useIngredientes({ ingredientes: receta.ingredientes });
            }
            await loadMenu();
        } catch (err) {
            console.error("Error guardando receta:", err);
            loadMenu();
        }
    };

    const handleRemove = async (id) => {
        await deleteMenuDiario(id);
        loadMenu();
        setConfirmOpen(null);
    };

    const handleClearDay = async (fecha) => {
        await clearMenuDay(fecha);
        loadMenu();
        setClearDate(null);
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <div>
                    <div className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>Menú Semanal</div>
                    <div className="page-subtitle">Foto por defecto en cada día, reemplazada automáticamente con la foto y título de la receta que elijas</div>
                </div>
                <div className="week-nav" style={{ background: '#FFF', padding: '6px 14px', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
                    <button className="btn-icon" onClick={() => setSemana(semana - 1)}>←</button>
                    <span className="week-label" style={{ fontWeight: 700, padding: '0 10px' }}>
                        {dias[0].toLocaleDateString()} - {dias[6].toLocaleDateString()}
                    </span>
                    <button className="btn-icon" onClick={() => setSemana(semana + 1)}>→</button>
                </div>
            </div>

            <div className="page-body">
                <div className="menu-grid" style={{ gap: 12, background: 'transparent', border: 'none' }}>
                    {dias.map((day, idx) => {
                        const fechaStr = formatDateLocal(day);
                        const recetasDelDia = menu[fechaStr] || [];
                        const theme = dayColors[idx % 7];

                        const recetasPrincipal = recetasDelDia.filter(r => r.categoria_nombre !== 'Menú Bebé');
                        const recetasBebe = recetasDelDia.filter(r => r.categoria_nombre === 'Menú Bebé');

                        return (
                            <div 
                                key={fechaStr} 
                                className="menu-day-col" 
                                style={{
                                    background: theme.bg,
                                    border: `2px solid ${theme.border}`,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Encabezado del día */}
                                <div 
                                    className="menu-day-header"
                                    style={{
                                        background: theme.headerBg,
                                        borderBottom: `2px solid ${theme.border}`,
                                        padding: '14px 10px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div 
                                        className="menu-day-name" 
                                        style={{ 
                                            color: theme.text, 
                                            fontWeight: '900', 
                                            fontSize: '0.95rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em'
                                        }}
                                    >
                                        {day.toLocaleDateString('es-ES', { weekday: 'long' })}
                                    </div>
                                    <div className="menu-day-date" style={{ color: theme.text, opacity: 0.8, fontWeight: '700', fontSize: '0.75rem', marginTop: 2 }}>
                                        {fechaStr}
                                    </div>
                                </div>

                                <div className="menu-day-content" style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    
                                    {/* 1. MENÚ PRINCIPAL */}
                                    <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: theme.text, marginBottom: 8, letterSpacing: '0.05em' }}>
                                            🍴 MENÚ PRINCIPAL
                                        </div>

                                        {/* SI NO HAY COMIDA: CARD CLICKEABLE CON FOTO POR DEFECTO → ABRE MODAL PARA ELEGIR RECETA */}
                                        {recetasPrincipal.length === 0 ? (
                                            <div 
                                                onClick={() => { setSelectedDate(fechaStr); setModalOpen(true); }}
                                                style={{ 
                                                    marginBottom: 12, 
                                                    border: `2px dashed ${theme.border}`,
                                                    background: '#FFFFFF',
                                                    borderRadius: '14px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                                            >
                                                <div style={{ position: 'relative' }}>
                                                    <img 
                                                        src={DEFAULT_FOOD_IMAGE} 
                                                        alt="Haz clic para elegir comida" 
                                                        style={{ height: '130px', width: '100%', objectFit: 'cover', display: 'block', opacity: 0.7, filter: 'brightness(0.85)' }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        color: '#FFF', fontWeight: 900, fontSize: '1.6rem'
                                                    }}>
                                                        ＋
                                                    </div>
                                                </div>
                                                <div style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 800, color: theme.text }}>
                                                    👆 Toca para elegir comida
                                                </div>
                                            </div>
                                        ) : (
                                            /* FOTO Y TÍTULO DE LA RECETA SELECCIONADA — CLIC PARA CAMBIAR */
                                            recetasPrincipal.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    style={{ 
                                                        marginBottom: 12, 
                                                        border: `1.5px solid ${theme.border}`,
                                                        background: '#FFFFFF',
                                                        borderRadius: '14px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 14px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    <div 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => { setSelectedDate(fechaStr); setModalOpen(true); }}
                                                    >
                                                        <img 
                                                            src={item.imagen || DEFAULT_FOOD_IMAGE} 
                                                            alt={item.receta_nombre} 
                                                            style={{ height: '130px', width: '100%', objectFit: 'cover', display: 'block' }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = DEFAULT_FOOD_IMAGE;
                                                            }}
                                                        />
                                                    
                                                        <div style={{ padding: '10px 12px' }}>
                                                            {item.categoria_nombre && (
                                                                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', background: theme.pill, color: theme.text, padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: 4 }}>
                                                                    {item.categoria_nombre}
                                                                </span>
                                                            )}
                                                            <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#1A1714', lineHeight: 1.3 }}>
                                                                {item.receta_nombre}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        className="btn-ghost btn-sm" 
                                                        style={{ width: '100%', color: '#D32F2F', fontWeight: '700', padding: '6px', borderTop: '1px solid #F0F0F0', borderRadius: 0 }} 
                                                        onClick={(e) => { e.stopPropagation(); setConfirmOpen(item.id); }}
                                                    >
                                                        🗑️ Quitar
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* 2. SECCIÓN MENÚ BEBÉ */}
                                    <div style={{
                                        background: '#EBF5FF',
                                        border: '2px dashed #42A5F5',
                                        borderRadius: '14px',
                                        padding: '10px',
                                        marginTop: 'auto'
                                    }}>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', color: '#0D47A1', marginBottom: 8, letterSpacing: '0.04em' }}>
                                            👶 SECCIÓN MENÚ BEBÉ
                                        </div>

                                        {recetasBebe.length === 0 ? (
                                            <div 
                                                onClick={() => { setSelectedDate(fechaStr); setModalOpen(true); }}
                                                style={{ marginBottom: 10, textAlign: 'center', background: '#FFF', borderRadius: '10px', overflow: 'hidden', border: '1.5px dashed #90CAF9', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <div style={{ position: 'relative' }}>
                                                    <img 
                                                        src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80" 
                                                        alt="Toca para elegir menú bebé" 
                                                        style={{ height: '90px', width: '100%', objectFit: 'cover', opacity: 0.7, filter: 'brightness(0.85)' }}
                                                    />
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.25)',
                                                        color: '#FFF', fontWeight: 900, fontSize: '1.4rem'
                                                    }}>
                                                        ＋
                                                    </div>
                                                </div>
                                                <div style={{ padding: '6px', fontSize: '0.75rem', color: '#0D47A1', fontWeight: '800' }}>
                                                    👆 Toca para elegir menú bebé
                                                </div>
                                            </div>
                                        ) : (
                                            recetasBebe.map(item => (
                                                <div 
                                                    key={item.id} 
                                                    style={{ 
                                                        marginBottom: 10, 
                                                        border: '1.5px solid #90CAF9',
                                                        background: '#FFFFFF',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 3px 10px rgba(0,0,0,0.06)'
                                                    }}
                                                >
                                                    <div 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => { setSelectedDate(fechaStr); setModalOpen(true); }}
                                                    >
                                                        <img 
                                                            src={item.imagen || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"} 
                                                            alt={item.receta_nombre} 
                                                            style={{ height: '110px', width: '100%', objectFit: 'cover', display: 'block' }}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";
                                                            }}
                                                        />
                                                    
                                                        <div style={{ padding: '8px 10px' }}>
                                                            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0D47A1', lineHeight: 1.3 }}>
                                                                🍼 {item.receta_nombre}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <button 
                                                        className="btn-ghost btn-sm" 
                                                        style={{ width: '100%', color: '#D32F2F', fontWeight: '700', padding: '5px', borderTop: '1px solid #F0F0F0', borderRadius: 0 }} 
                                                        onClick={(e) => { e.stopPropagation(); setConfirmOpen(item.id); }}
                                                    >
                                                        🗑️ Quitar
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {recetasDelDia.length > 0 && (
                                        <button 
                                            className="btn-danger btn-sm" 
                                            style={{ width: '100%', marginTop: 4, padding: '6px', borderRadius: '8px' }} 
                                            onClick={() => setClearDate(fechaStr)}
                                        >
                                            Limpiar día completo
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Agregar receta - ${selectedDate}`} noFooter>
                <Recetas onSelectReceta={handleAddReceta} seleccionModo={true} />
            </Modal>

            <ConfirmDialog isOpen={confirmOpen !== null} onClose={() => setConfirmOpen(null)} onConfirm={handleRemove} title="Quitar receta" message="¿Eliminar esta receta del menú?" />
            <ConfirmDialog isOpen={clearDate !== null} onClose={() => setClearDate(null)} onConfirm={() => handleClearDay(clearDate)} title="Limpiar día" message="¿Eliminar todas las recetas de este día?" />
        </div>
    );
}