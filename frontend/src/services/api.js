import axios from 'axios';

// En producción (mismo host o variable de entorno) usa '/api', en local usa 'http://localhost:7001/api'
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:7001/api');

const API = axios.create({
    baseURL,
});

// Categorías
export const getCategorias = () => API.get('/categorias');
export const createCategoria = (data) => API.post('/categorias', data);
export const updateCategoria = (id, data) => API.put(`/categorias/${id}`, data);
export const deleteCategoria = (id) => API.delete(`/categorias/${id}`);

// Recetas
export const getRecetas = () => API.get('/recetas');
export const createReceta = (data) => API.post('/recetas', data);
export const updateReceta = (id, data) => API.put(`/recetas/${id}`, data);
export const deleteReceta = (id) => API.delete(`/recetas/${id}`);

// Menú Semanal / Diario
export const getMenuDiario = (start, end) => {
    if (start && typeof start === 'object') {
        return API.get(`/menu-diario?start=${start.start}&end=${start.end}`);
    }
    return API.get(`/menu-diario?start=${start}&end=${end}`);
};
export const setMenuDiario = (data) => API.post('/menu-diario', data);
export const deleteMenuDiario = (id) => API.delete(`/menu-diario/${id}`);
export const clearMenuDay = (fecha) => API.delete(`/menu-diario/day/${fecha}`);

// Lista de Compras
export const getListaCompras = () => API.get('/lista-compras');

// Exportaciones con nombres compatibles
export const createListaItem = (data) => API.post('/lista-compras', data);
export const updateListaItem = (id, data) => API.put(`/lista-compras/${id}`, data);
export const deleteListaItem = (id) => API.delete(`/lista-compras/${id}`);

export const createItemCompra = (data) => API.post('/lista-compras', data);
export const updateItemCompra = (id, data) => API.put(`/lista-compras/${id}`, data);
export const deleteItemCompra = (id) => API.delete(`/lista-compras/${id}`);

export const updateItemEstado = (id, estado) => API.patch(`/lista-compras/${id}/estado`, { estado });
export const toggleListaItem = (id) => API.patch(`/lista-compras/${id}/toggle`);
export const toggleNecesario = (id) => API.patch(`/lista-compras/${id}/necesario`);
export const clearComprados = () => API.delete('/lista-compras/clear-comprados');
export const addIngredientes = (data) => API.post('/lista-compras/add-ingredientes', data);
export const useIngredientes = (data) => API.post('/lista-compras/use-ingredientes', data);

export default API;