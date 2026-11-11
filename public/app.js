'use strict';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
let mode = 'login', user, page = 1, pages = 0, editing = null, deleting = null, toastTimer;
async function api(path, options = {}) {
 const response = await fetch('/api' + path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
 const data = response.status === 204 ? null : await response.json();
 if (!response.ok) {
  if (response.status === 401 && user) { user = null; showAuth(); }
  throw new Error(data.error + (data.details ? '\n' + data.details.map(d => d.field + ': ' + d.message).join('\n') : ''));
 }
 return data;
}
function notify(text) { clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 3500); }
function showAuth() { $('auth-view').hidden = false; $('inventory-view').hidden = true; $('logout').hidden = true; document.querySelectorAll('dialog[open]').forEach(d => d.close()); $('products').replaceChildren(); }
async function showInventory() { $('auth-view').hidden = true; $('inventory-view').hidden = false; $('logout').hidden = false; $('greeting').textContent = 'HOLA, ' + user.name.toUpperCase(); await loadProducts(); }
function setMode(next) {
 mode = next; const register = mode === 'register';
 $('name-label').hidden = !register; $('auth-name').required = register;
 $('password').minLength = register ? 12 : 1; $('password').autocomplete = register ? 'new-password' : 'current-password';
 $('password-help').hidden = !register;
 $('auth-title').textContent = register ? 'Todo empieza aquí.' : 'Qué gusto verte.';
 $('auth-caption').textContent = register ? 'Crea tu cuenta y organiza tu catálogo.' : 'Inicia sesión para gestionar tus productos.';
 $('auth-submit').textContent = register ? 'Crear mi cuenta →' : 'Entrar a mi inventario →';
 ['login', 'register'].forEach(m => { $(m + '-tab').classList.toggle('active', m === mode); $(m + '-tab').setAttribute('aria-pressed', String(m === mode)); });
 $('auth-error').textContent = '';
}
$('login-tab').onclick = () => setMode('login'); $('register-tab').onclick = () => setMode('register');
$('auth-form').onsubmit = async event => {
 event.preventDefault(); $('auth-submit').disabled = true; $('auth-error').textContent = '';
 try {
  const body = { email: $('email').value.trim(), password: $('password').value };
  if (mode === 'register') body.name = $('auth-name').value.trim();
  const data = await api('/auth/' + mode, { method: 'POST', body: JSON.stringify(body) });
  user = data.user; page = 1; $('password').value = ''; await showInventory();
 } catch (error) { $('auth-error').textContent = error.message; }
 finally { $('auth-submit').disabled = false; }
};
$('logout').onclick = async () => {
 $('logout').disabled = true;
 try { await api('/auth/logout', { method: 'POST', body: '{}' }); user = null; showAuth(); notify('Sesión cerrada'); }
 catch (e) { $('inventory-error').textContent = e.message; }
 finally { $('logout').disabled = false; }
};
async function loadProducts() {
 $('inventory-error').textContent = ''; $('refresh').disabled = true;
 try {
  const data = await api('/products?page=' + page + '&limit=10'); pages = data.pages;
  if (page > Math.max(1, pages)) { page = Math.max(1, pages); return await loadProducts(); }
  $('total').textContent = data.total; $('units').textContent = data.products.reduce((n, p) => n + p.stock, 0);
  $('value').textContent = money(data.products.reduce((n, p) => n + p.stock * p.price, 0));
  $('products').replaceChildren();
  data.products.forEach(p => {
   const row = document.createElement('tr');
   const name = document.createElement('td'); name.textContent = p.name;
   const price = document.createElement('td'); price.textContent = money(p.price);
   const stock = document.createElement('td'); const badge = document.createElement('span'); badge.className = 'badge' + (p.stock === 0 ? ' low' : ''); badge.textContent = p.stock === 0 ? 'Sin existencias' : p.stock + ' unidades'; stock.append(badge);
   const actions = document.createElement('td');
   [['Ver', () => view(p._id)], ['Editar', () => openProduct(p)], ['Eliminar', () => askDelete(p)]].forEach(([text, fn]) => { const button = document.createElement('button'); button.textContent = text; button.className = 'quiet'; button.setAttribute('aria-label', text + ' ' + p.name); button.onclick = fn; actions.append(button); });
   row.append(name, price, stock, actions); $('products').append(row);
  });
  $('empty').hidden = data.total !== 0; $('table-wrap').hidden = data.total === 0;
  $('page-label').textContent = data.total ? 'Página ' + page + ' de ' + pages + ' · ' + data.total + ' productos' : 'Tu catálogo está listo para empezar';
  $('previous').disabled = page <= 1; $('next').disabled = page >= pages;
 } catch (e) { $('inventory-error').textContent = e.message; }
 finally { $('refresh').disabled = false; }
}
function openProduct(product = null) {
 editing = product?._id || null; $('product-title').textContent = editing ? 'Editar producto' : 'Agregar producto';
 $('product-name').value = product?.name || ''; $('description').value = product?.description || '';
 $('price').value = product?.price ?? ''; $('stock').value = product?.stock ?? '';
 $('product-error').textContent = ''; $('product-dialog').showModal();
}
$('new-product').onclick = () => openProduct(); $('first-product').onclick = () => openProduct();
$('close-dialog').onclick = () => $('product-dialog').close();
$('product-form').onsubmit = async event => {
 event.preventDefault(); $('save-product').disabled = true; $('product-error').textContent = '';
 try {
  await api('/products' + (editing ? '/' + editing : ''), { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ name: $('product-name').value.trim(), description: $('description').value.trim(), price: Number($('price').value), stock: Number($('stock').value) }) });
  $('product-dialog').close(); notify(editing ? 'Producto actualizado' : 'Producto agregado'); if (!editing) page = 1; await loadProducts();
 } catch (e) { $('product-error').textContent = e.message; }
 finally { $('save-product').disabled = false; }
};
async function view(id) {
 try { const { product: p } = await api('/products/' + id); $('detail-name').textContent = p.name; $('detail-description').textContent = p.description || 'Sin descripción'; $('detail-meta').textContent = money(p.price) + ' MXN · ' + p.stock + ' unidades'; $('detail-dialog').showModal(); }
 catch (e) { $('inventory-error').textContent = e.message; }
}
$('close-detail').onclick = () => $('detail-dialog').close();
function askDelete(p) { deleting = p._id; $('delete-name').textContent = p.name; $('delete-error').textContent = ''; $('delete-dialog').showModal(); }
$('cancel-delete').onclick = () => $('delete-dialog').close();
$('confirm-delete').onclick = async () => {
 $('confirm-delete').disabled = true;
 try { await api('/products/' + deleting, { method: 'DELETE', body: '{}' }); $('delete-dialog').close(); notify('Producto eliminado'); await loadProducts(); }
 catch (e) { $('delete-error').textContent = e.message; }
 finally { $('confirm-delete').disabled = false; }
};
$('refresh').onclick = loadProducts;
$('previous').onclick = () => { page--; loadProducts(); }; $('next').onclick = () => { page++; loadProducts(); };
(async () => { try { const data = await api('/auth/me'); user = data.user; await showInventory(); } catch (e) { showAuth(); if (!e.message.includes('Inicia sesión') && !e.message.includes('Sesión inválida')) $('auth-error').textContent = e.message; } })();
