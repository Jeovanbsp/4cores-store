<template>
  <div class="admin-page">
    <Notification :message="toastMsg" :type="toastType" v-model:show="showToast" />

    <!-- HEADER -->
    <header class="admin-header">
      <div class="admin-header-left">
        <img src="../assets/4cores.png" class="admin-logo" />
        <div>
          <h1 class="admin-title">Painel Admin</h1>
          <p class="admin-subtitle">Gerenciamento de Produtos</p>
        </div>
      </div>
      <div class="admin-header-right">
        <button class="btn-store" @click="goToStore">
          <StoreIcon :size="16" />
          Ver Loja
        </button>
        <button class="btn-logout" @click="logout">
          <LogOutIcon :size="16" />
          Sair
        </button>
      </div>
    </header>

    <div class="admin-layout">
      <!-- FORMULÁRIO -->
      <aside class="form-panel">
        <div class="panel-title">
          <PackagePlusIcon :size="18" />
          {{ editingId ? 'Editar Produto' : 'Novo Produto' }}
        </div>

        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group">
            <label>Nome *</label>
            <input v-model="form.name" type="text" placeholder="Nome do produto" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Preço (R$) *</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" placeholder="0,00" required />
            </div>
            <div class="form-group">
              <label>Estoque</label>
              <input v-model.number="form.stock" type="number" min="0" placeholder="0" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoria</label>
              <select v-model="form.category">
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tópico</label>
              <input v-model="form.topic" type="text" placeholder="Ex: Fantasia, Festa..." />
            </div>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" rows="3" placeholder="Descrição curta do produto..."></textarea>
          </div>

          <div class="form-row-check">
            <div class="form-group">
              <label>Modo de exibição</label>
              <select v-model="form.displayMode">
                <option value="single">Foto única</option>
                <option value="gallery">Galeria</option>
              </select>
            </div>
            <div class="form-check">
              <label class="toggle-label">
                <input type="checkbox" v-model="form.visible" />
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                Visível na loja
              </label>
            </div>
          </div>

          <!-- UPLOAD DE FOTOS -->
          <div class="form-group">
            <label>Fotos</label>
            <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
              <UploadCloudIcon :size="24" class="upload-icon" />
              <p>Clique ou arraste as fotos aqui</p>
              <input ref="fileInput" type="file" accept="image/*" multiple @change="handleFiles" style="display:none" />
            </div>
            <div v-if="form.images.length" class="image-preview-grid">
              <div v-for="(img, i) in form.images" :key="i" class="image-thumb-wrap">
                <img :src="img" class="image-thumb" />
                <button type="button" class="btn-remove-img" @click="removeImage(i)">×</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button v-if="editingId" type="button" class="btn-cancel" @click="resetForm">
              Cancelar
            </button>
            <button type="submit" class="btn-save" :disabled="saving">
              <SaveIcon :size="15" />
              {{ saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Produto' }}
            </button>
          </div>
        </form>
      </aside>

      <!-- LISTA DE PRODUTOS -->
      <main class="products-panel">
        <div class="products-panel-header">
          <div class="panel-title">
            <LayoutListIcon :size="18" />
            Produtos ({{ products.length }})
          </div>
          <div class="search-wrap">
            <SearchIcon :size="15" class="search-icon" />
            <input v-model="search" type="text" placeholder="Buscar produto..." class="search-input" />
          </div>
        </div>

        <div v-if="filteredProducts.length" class="product-list">
          <div v-for="p in filteredProducts" :key="p._id" class="product-row" :class="{ hidden: !p.visible }">
            <div class="product-row-img">
              <img v-if="p.images && p.images.length" :src="p.images[0]" />
              <div v-else class="no-img-placeholder">
                <ImageIcon :size="20" />
              </div>
            </div>

            <div class="product-row-info">
              <span class="product-row-name">{{ p.name }}</span>
              <span class="product-row-meta">
                <span class="tag-category">{{ p.category === 'aluguel' ? 'Aluguel' : 'Venda' }}</span>
                <span v-if="p.topic" class="tag-topic">{{ p.topic }}</span>
              </span>
              <span class="product-row-price">R$ {{ formatPrice(p.price) }}</span>
            </div>

            <div class="product-row-stock">
              <span :class="p.stock > 0 ? 'badge-ok' : 'badge-out'">
                {{ p.stock > 0 ? `${p.stock} un.` : 'Esgotado' }}
              </span>
              <span :class="p.visible ? 'badge-visible' : 'badge-hidden'">
                {{ p.visible ? 'Visível' : 'Oculto' }}
              </span>
            </div>

            <div class="product-row-actions">
              <button class="btn-edit" @click="editProduct(p)">
                <PencilIcon :size="14" />
                Editar
              </button>
              <button class="btn-delete" @click="confirmDelete(p)">
                <Trash2Icon :size="14" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-list">
          <PackageSearchIcon :size="36" />
          <p>Nenhum produto encontrado</p>
        </div>
      </main>
    </div>

    <!-- MODAL CONFIRMAR EXCLUSÃO -->
    <Transition name="fade">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal-card">
          <Trash2Icon :size="28" class="modal-icon-danger" />
          <h3>Excluir produto?</h3>
          <p>Tem certeza que deseja excluir <strong>"{{ deleteTarget.name }}"</strong>? Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="deleteTarget = null">Cancelar</button>
            <button class="btn-delete-confirm" @click="deleteProduct">Excluir</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import {
  StoreIcon, LogOutIcon, PackagePlusIcon, SaveIcon, SearchIcon,
  LayoutListIcon, PencilIcon, Trash2Icon, PackageSearchIcon,
  UploadCloudIcon, ImageIcon
} from 'lucide-vue-next'
import Notification from '../components/Notification.vue'
import { API_URL } from '../config'

const router = useRouter()

const products = ref([])
const search = ref('')
const saving = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)
const fileInput = ref(null)

const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')

const defaultForm = () => ({
  name: '',
  price: '',
  stock: 1,
  category: 'venda',
  topic: '',
  description: '',
  visible: true,
  displayMode: 'single',
  images: []
})

const form = ref(defaultForm())

const token = localStorage.getItem('token')
const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase()
  return products.value.filter(p => p.name?.toLowerCase().includes(q))
})

const formatPrice = (val) => Number(val).toFixed(2).replace('.', ',')

const showNotif = (msg, type = 'success') => {
  toastMsg.value = msg
  toastType.value = type
  showToast.value = true
}

const loadProducts = async () => {
  const res = await axios.get(`${API_URL}/products`)
  products.value = res.data
}

const resetForm = () => {
  form.value = defaultForm()
  editingId.value = null
}

const editProduct = (p) => {
  editingId.value = p._id
  form.value = {
    name: p.name,
    price: p.price,
    stock: p.stock,
    category: p.category || 'venda',
    topic: p.topic || '',
    description: p.description || '',
    visible: p.visible !== false,
    displayMode: p.displayMode || 'single',
    images: p.images ? [...p.images] : []
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const saveProduct = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await axios.put(`${API_URL}/products/${editingId.value}`, form.value, authHeaders)
      showNotif('Produto atualizado com sucesso!')
    } else {
      await axios.post(`${API_URL}/products`, form.value, authHeaders)
      showNotif('Produto criado com sucesso!')
    }
    resetForm()
    await loadProducts()
  } catch (err) {
    showNotif('Erro ao salvar produto.', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (p) => {
  deleteTarget.value = p
}

const deleteProduct = async () => {
  try {
    await axios.delete(`${API_URL}/products/${deleteTarget.value._id}`, authHeaders)
    showNotif('Produto excluído.')
    deleteTarget.value = null
    await loadProducts()
  } catch {
    showNotif('Erro ao excluir produto.', 'error')
  }
}

const triggerUpload = () => fileInput.value?.click()

const processFiles = (files) => {
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => form.value.images.push(e.target.result)
    reader.readAsDataURL(file)
  })
}

const handleFiles = (e) => processFiles(e.target.files)
const handleDrop = (e) => processFiles(e.dataTransfer.files)
const removeImage = (i) => form.value.images.splice(i, 1)

const goToStore = () => router.push('/')
const logout = () => {
  localStorage.removeItem('token')
  router.push('/')
}

onMounted(loadProducts)
</script>

<style scoped>
* { box-sizing: border-box; }

.admin-page {
  min-height: 100vh;
  background: #f1f5f9;
  font-family: sans-serif;
}

/* HEADER */
.admin-header {
  background: #1e293b;
  color: white;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.admin-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 2px;
}

.admin-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.admin-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
}

.admin-header-right {
  display: flex;
  gap: 8px;
}

.btn-store {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #334155;
  color: white;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-store:hover { background: #475569; }

.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #E30613;
  color: white;
  font-size: 0.82rem;
  cursor: pointer;
}

/* LAYOUT */
.admin-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  padding: 20px;
  max-width: 1300px;
  margin: auto;
}

@media (max-width: 900px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
}

/* PANELS */
.form-panel, .products-panel {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 18px;
}

/* FORM */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #E30613;
  outline: none;
  background: white;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-row-check {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: end;
}

/* TOGGLE */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding-bottom: 8px;
}

.toggle-label input[type=checkbox] { display: none; }

.toggle-track {
  width: 38px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 99px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-label input:checked + .toggle-track {
  background: #22c55e;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-label input:checked + .toggle-track .toggle-thumb {
  transform: translateX(16px);
}

/* UPLOAD */
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.upload-area:hover {
  border-color: #E30613;
  background: #fff5f5;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 6px;
}

.upload-area p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.image-thumb-wrap {
  position: relative;
}

.image-thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
}

.btn-remove-img {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #E30613;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FORM ACTIONS */
.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-save {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover { background: #E30613; }
.btn-save:disabled { background: #cbd5e1; cursor: not-allowed; }

.btn-cancel {
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  color: #64748b;
}

/* PRODUCTS PANEL */
.products-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding: 8px 12px 8px 32px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.85rem;
  background: #f8fafc;
  width: 200px;
}

.search-input:focus {
  border-color: #E30613;
  outline: none;
}

/* PRODUCT LIST */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid #f1f5f9;
  background: #fafafa;
  transition: border-color 0.2s;
}

.product-row:hover { border-color: #e2e8f0; }
.product-row.hidden { opacity: 0.55; }

.product-row-img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-row-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img-placeholder {
  color: #cbd5e1;
}

.product-row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-row-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-row-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag-category, .tag-topic {
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 20px;
  font-weight: 600;
}

.tag-category {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag-topic {
  background: #f3e8ff;
  color: #7e22ce;
}

.product-row-price {
  font-size: 0.82rem;
  font-weight: 700;
  color: #E30613;
}

.product-row-stock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.badge-ok, .badge-out, .badge-visible, .badge-hidden {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.badge-ok { background: #dcfce7; color: #16a34a; }
.badge-out { background: #fee2e2; color: #dc2626; }
.badge-visible { background: #d1fae5; color: #059669; }
.badge-hidden { background: #f1f5f9; color: #94a3b8; }

.product-row-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit:hover { background: #334155; }

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover { background: #fecaca; }

.empty-list {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 380px;
  width: 100%;
  text-align: center;
}

.modal-icon-danger {
  color: #dc2626;
  margin-bottom: 10px;
}

.modal-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px;
}

.modal-card p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 20px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-delete-confirm {
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
