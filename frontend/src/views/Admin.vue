<template>
  <div class="admin-page">
    <ConfirmModal ref="confirmModal" />
    <ToastNotification ref="toast" />
    
    <header class="admin-nav">
      <div class="nav-brand" @click="$router.push('/')" style="cursor: pointer;">
        <div class="brand-icon">
          <Package2Icon :size="20" color="white" />
        </div>
        <h1>Dashboard <span>4Cores</span></h1>
      </div>
      <div class="nav-links">
        <a href="/" class="nav-link">Ver Loja</a>
      </div>
    </header>

    <div class="admin-content">
      <main class="main-column">
        <section class="glass-card">
          <div class="card-header">
            <div class="header-icon">
              <PlusCircleIcon v-if="!editingProduct" :size="18" />
              <EditIcon v-else :size="18" />
            </div>
            <h2>{{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}</h2>
          </div>
          
          <form @submit.prevent="handleProductSubmit" class="modern-form">
            <div class="input-row">
              <div class="input-group">
                <label>Nome do Produto</label>
                <input v-model="product.name" type="text" placeholder="Ex: Iron Man Mark 85" required />
              </div>
              <div class="input-group">
                <label>Tópico / Grupo (Filtro)</label>
                <input v-model="product.topic" type="text" placeholder="Ex: Marvel, Star Wars..." list="topics-list" required />
                <datalist id="topics-list">
                  <option v-for="t in uniqueTopics" :key="t" :value="t" />
                </datalist>
              </div>
            </div>
            
            <div class="input-row">
              <div class="input-group">
                <label>Preço</label>
                <div class="price-input-wrap">
                  <span class="price-prefix">R$</span>
                  <input v-model="priceDisplay" @input="onPriceInput" @blur="onPriceBlur" type="text" inputmode="decimal" placeholder="0,00" required />
                </div>
              </div>
            </div>

            <div class="input-group">
              <label>Informações Opcionais (Descrição curta)</label>
              <textarea 
                v-model="product.description" 
                placeholder="Ex: Material PLA, 15cm, pintura artesanal..." 
                rows="2"
              ></textarea>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Categoria</label>
                <select v-model="product.category">
                  <option value="venda">Para Venda</option>
                  <option value="aluguel">Para Aluguel</option>
                </select>
              </div>
              <div class="input-group">
                <label>Exibição</label>
                <select v-model="product.displayMode">
                  <option value="single">Foto Única</option>
                  <option value="carousel">Carrossel</option>
                </select>
              </div>
            </div>

            <div class="input-group checkbox-group">
              <label class="toggle-switch">
                <input type="checkbox" v-model="product.visible" />
                <span class="slider"></span>
                <span class="label-text">{{ product.visible ? 'Produto Visível na Loja' : 'Produto OCULTO na Loja' }}</span>
              </label>
            </div>

            <div class="input-group checkbox-group">
              <label class="toggle-switch">
                <input type="checkbox" v-model="product.soldOut" />
                <span class="slider soldout"></span>
                <span class="label-text">{{ product.soldOut ? 'Marcado como ESGOTADO' : 'Produto Disponível para Encomenda' }}</span>
              </label>
            </div>

            <div class="upload-section">
              <label class="upload-label">Fotos do Produto</label>
              <div class="upload-container">
                <label class="upload-box">
                  <UploadCloudIcon :size="24" />
                  <span>Selecionar Fotos</span>
                  <input type="file" multiple @change="handleFileUpload" accept="image/*" hidden />
                </label>

                <div v-if="product.images.length > 0" class="image-preview-grid">
                  <div v-for="(img, idx) in product.images" :key="idx" class="preview-card">
                    <img :src="img" />
                    <button type="button" @click="removeImage(idx)" class="btn-remove-img">×</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button v-if="editingProduct" type="button" @click="resetProductForm" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingProduct ? 'Salvar Alterações' : 'Lançar Produto' }}
              </button>
            </div>
          </form>
        </section>

        <section class="glass-card">
          <div class="card-header">
            <div class="header-icon secondary"><LayoutGridIcon :size="18" /></div>
            <h2>Itens no Catálogo <span class="count-tag">{{ filteredAdminProducts.length }}/{{ productsList.length }}</span></h2>
          </div>

          <div class="list-controls">
            <div class="search-box">
              <SearchIcon :size="16" class="search-icon" />
              <input
                v-model="listSearch"
                type="text"
                placeholder="Buscar por nome, tópico ou categoria..."
                class="list-search-input"
              />
              <button
                v-if="listSearch"
                type="button"
                class="clear-search"
                @click="listSearch = ''"
                aria-label="Limpar busca"
              >×</button>
            </div>
            <select v-model="listSort" class="list-sort">
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="name-asc">Nome (A→Z)</option>
              <option value="name-desc">Nome (Z→A)</option>
              <option value="price-asc">Preço (menor)</option>
              <option value="price-desc">Preço (maior)</option>
            </select>
          </div>

          <div v-if="filteredAdminProducts.length === 0" class="list-empty">
            Nenhum produto corresponde à busca.
          </div>
          <div v-else class="items-grid">
            <div v-for="p in filteredAdminProducts" :key="p._id" class="product-list-item" :class="{ 'hidden-item': p.visible === false }">
              <div class="item-main-info">
                <div class="miniature-container">
                  <img :src="p.images[0] || 'https://via.placeholder.com/50'" class="miniature" />
                </div>
                <div class="text-details">
                  <strong>{{ p.name }} <span v-if="p.visible === false" class="tag-hidden">OCULTO</span></strong>
                  <div class="meta-info">
                    <span class="topic-tag">{{ p.topic || 'Geral' }}</span>
                    <span class="badge" :class="p.category">{{ p.category }}</span>
                    <span v-if="p.soldOut" class="stock-label zero">Esgotado</span>
                    <span v-else class="stock-label">Disponível</span>
                  </div>
                </div>
              </div>
              <div class="item-btns">
                <button @click="editProduct(p)" class="btn-icon"><EditIcon :size="16" /></button>
                <button @click="deleteProduct(p._id)" class="btn-icon delete"><Trash2Icon :size="16" /></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <aside class="side-column">
        <section class="glass-card">
          <div class="card-header">
            <div class="header-icon hero-icon"><ImageIcon :size="18" /></div>
            <h2>Imagens em Destaque <span class="count-tag">{{ heroImages.length }}</span></h2>
          </div>
          
          <form @submit.prevent="handleHeroImageSubmit" class="modern-form">
            <div class="upload-section">
              <label class="upload-label">Adicionar Hero</label>
              <div class="upload-container compact">
                <label class="upload-box small">
                  <UploadCloudIcon :size="20" />
                  <span>Selecionar</span>
                  <input type="file" @change="handleHeroImageUpload" accept="image/*" hidden />
                </label>
                <div v-if="heroImagePreview" class="hero-preview small">
                  <img :src="heroImagePreview" />
                  <button type="button" @click="heroImagePreview = null" class="btn-remove-img">×</button>
                </div>
              </div>
            </div>
            
            <input v-model="heroImageForm.altText" type="text" placeholder="Texto alternativo" />
            <input v-model="heroImageForm.link" type="url" placeholder="Link URL (opcional)" />
            
            <button type="submit" class="btn-success" :disabled="!heroImagePreview">Adicionar</button>
          </form>
          
          <div class="hero-list" v-if="heroImages.length > 0">
            <div v-for="(img, index) in heroImages" :key="img._id" class="hero-item compact">
              <img :src="img.imageUrl" class="hero-thumb" />
              <div class="hero-info">
                <span class="hero-alt">{{ img.altText || '-' }}</span>
              </div>
              <div class="hero-actions">
                <button @click="moveHeroUp(index)" :disabled="index === 0" class="btn-icon"><ChevronUpIcon :size="14" /></button>
                <button @click="moveHeroDown(index)" :disabled="index === heroImages.length - 1" class="btn-icon"><ChevronDownIcon :size="14" /></button>
                <button @click="deleteHeroImage(img._id)" class="btn-icon delete"><Trash2Icon :size="14" /></button>
              </div>
            </div>
          </div>
          <div v-else class="list-empty small">
            Nenhuma imagem adicionada.
          </div>
        </section>

        <section class="glass-card">
          <div class="card-header">
            <div class="header-icon info"><MessageSquareIcon :size="18" /></div>
            <h2>Feedbacks</h2>
          </div>
          <form @submit.prevent="handleFeedbackSubmit" class="modern-form">
            <input v-model="feedback.name" type="text" placeholder="Nome do Cliente" required />
            <textarea v-model="feedback.text" rows="3" placeholder="Depoimento..." required></textarea>
            <div class="feedback-footer">
              <select v-model.number="feedback.stars">
                <option :value="5">5 Estrelas</option>
                <option :value="4">4 Estrelas</option>
                <option :value="3">3 Estrelas</option>
              </select>
              <button type="submit" class="btn-success">{{ editingFeedback ? 'Atualizar' : 'Salvar' }}</button>
            </div>
          </form>
          
          <div class="feedback-list">
            <div v-for="f in feedbacksList" :key="f._id" class="feedback-item">
              <div class="f-header">
                <strong>{{ f.name || 'Cliente' }}</strong>
                <span class="stars">{{ f.stars || 5 }}★</span>
              </div>
              <p class="f-text">{{ f.text }}</p>
              <div class="f-actions-modern">
                <button @click="editFeedback(f)" class="btn-mini">Editar</button>
                <button @click="deleteFeedback(f._id)" class="btn-mini delete">Excluir</button>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { 
  PlusCircleIcon, EditIcon, Trash2Icon, Package2Icon, 
  LayoutGridIcon, MessageSquareIcon, UploadCloudIcon, SearchIcon,
  ImageIcon, ChevronUpIcon, ChevronDownIcon
} from 'lucide-vue-next';
import ConfirmModal from '../components/ConfirmModal.vue';
import ToastNotification from '../components/ToastNotification.vue';
import { API_URL } from '../config';

const productsList = ref([]);
const feedbacksList = ref([]);
const heroImages = ref([]);
const confirmModal = ref(null);
const toast = ref(null);
const editingProduct = ref(null);
const editingFeedback = ref(null);
const priceDisplay = ref('');
const listSearch = ref('');
const listSort = ref('recent');

// Hero Image states
const heroImagePreview = ref(null);
const heroImageForm = reactive({
  altText: '',
  link: ''
});

const product = reactive({ 
  name: '', 
  topic: '', 
  price: null, 
  category: 'venda', 
  displayMode: 'single', 
  images: [], 
  description: '',
  visible: true,
  soldOut: false
});

const onPriceInput = (e) => {
  let raw = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
  product.price = raw ? parseFloat(raw) : null;
};

const onPriceBlur = () => {
  if (product.price != null && !isNaN(product.price)) {
    priceDisplay.value = formatPriceDisplay(product.price);
  }
};

const formatPriceDisplay = (val) => {
  if (val == null || val === '') return '';
  return Number(val).toFixed(2).replace('.', ',');
};

const feedback = reactive({ name: '', text: '', stars: 5 });

const uniqueTopics = computed(() => {
  const topics = productsList.value.map(p => p.topic).filter(t => t);
  return [...new Set(topics)];
});

// Busca e ordenação da lista do admin. O _id do Mongo contém o timestamp de
// criação nos primeiros 4 bytes, então usamos ele para ordenar por data.
const filteredAdminProducts = computed(() => {
  const term = listSearch.value.trim().toLowerCase();
  const list = productsList.value.filter(p => {
    if (!term) return true;
    const haystack = [p.name, p.topic, p.category, p.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  });

  const sorted = [...list];
  switch (listSort.value) {
    case 'oldest':
      sorted.sort((a, b) => String(a._id).localeCompare(String(b._id)));
      break;
    case 'name-asc':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));
      break;
    case 'name-desc':
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'pt-BR'));
      break;
    case 'price-asc':
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case 'price-desc':
      sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case 'recent':
    default:
      sorted.sort((a, b) => String(b._id).localeCompare(String(a._id)));
  }
  return sorted;
});

const fetchData = async () => {
  try {
    const token = localStorage.getItem('4cores_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const [pRes, fRes, hRes] = await Promise.all([
      axios.get(`${API_URL}/products`, { headers }),
      axios.get(`${API_URL}/feedbacks`, { headers }),
      axios.get(`${API_URL}/hero-images`, { headers })
    ]);
    productsList.value = pRes.data;
    feedbacksList.value = fRes.data;
    heroImages.value = hRes.data;
  } catch (err) { 
    console.error("Erro ao carregar dados:", err);
    if (err.response?.status === 401) {
      console.log("Token expirado - removendo...");
      localStorage.removeItem('4cores_token');
    }
  }
};

const handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (f) => { product.images.push(f.target.result); };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => { product.images.splice(index, 1); };

const handleProductSubmit = async () => {
  try {
    const payload = { ...product };
    if (editingProduct.value) {
      await axios.put(`${API_URL}/products/${editingProduct.value._id}`, payload);
      toast.value?.showToast('Produto atualizado com sucesso!', 'success');
    } else {
      await axios.post(`${API_URL}/products`, payload);
      toast.value?.showToast('Produto criado com sucesso!', 'success');
    }
    resetProductForm();
    fetchData();
  } catch (err) { 
    toast.value?.showToast('Erro ao salvar produto.', 'error'); 
  }
};

const editProduct = (p) => {
  editingProduct.value = p;
  Object.assign(product, { 
    ...p, 
    visible: p.visible ?? true, 
    description: p.description ?? '',
    soldOut: p.soldOut ?? false
  });
  priceDisplay.value = formatPriceDisplay(p.price);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetProductForm = () => {
  editingProduct.value = null;
  priceDisplay.value = '';
  Object.assign(product, { 
    name: '', topic: '', price: null, 
    category: 'venda', displayMode: 'single', images: [], 
    description: '', visible: true, soldOut: false
  });
};

const deleteProduct = async (id) => {
  const confirmed = await confirmModal.value.open({
    title: 'Excluir Produto',
    message: 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });
  if (confirmed) {
    await axios.delete(`${API_URL}/products/${id}`);
    toast.value?.showToast('Produto excluído!', 'success');
    fetchData();
  }
};

const handleFeedbackSubmit = async () => {
  try {
    if (editingFeedback.value) {
      await axios.put(`${API_URL}/feedbacks/${editingFeedback.value._id}`, feedback);
      toast.value?.showToast('Feedback atualizado!', 'success');
    } else {
      await axios.post(`${API_URL}/feedbacks`, feedback);
      toast.value?.showToast('Feedback adicionado!', 'success');
    }
    resetFeedbackForm();
    fetchData();
  } catch (err) { 
    toast.value?.showToast('Erro ao salvar feedback.', 'error'); 
  }
};

const editFeedback = (f) => { editingFeedback.value = f; Object.assign(feedback, f); };
const resetFeedbackForm = () => { editingFeedback.value = null; Object.assign(feedback, { name: '', text: '', stars: 5 }); };
const deleteFeedback = async (id) => {
  const confirmed = await confirmModal.value.open({
    title: 'Excluir Feedback',
    message: 'Tem certeza que deseja excluir este feedback?',
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });
  if (confirmed) {
    await axios.delete(`${API_URL}/feedbacks/${id}`);
    toast.value?.showToast('Feedback excluído!', 'success');
    fetchData();
  }
};

// Hero Image functions
const handleHeroImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      heroImagePreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleHeroImageSubmit = async () => {
  if (!heroImagePreview.value) return;
  try {
    await axios.post(`${API_URL}/hero-images`, {
      imageUrl: heroImagePreview.value,
      altText: heroImageForm.altText,
      link: heroImageForm.link
    });
    heroImagePreview.value = null;
    heroImageForm.altText = '';
    heroImageForm.link = '';
    toast.value?.showToast('Imagem adicionada ao carrossel!', 'success');
    fetchData();
  } catch (err) { 
    toast.value?.showToast('Erro ao adicionar imagem.', 'error'); 
  }
};

const deleteHeroImage = async (id) => {
  const confirmed = await confirmModal.value.open({
    title: 'Excluir Imagem',
    message: 'Tem certeza que deseja excluir esta imagem de destaque?',
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });
  if (confirmed) {
    try {
      await axios.delete(`${API_URL}/hero-images/${id}`);
      toast.value?.showToast('Imagem removida!', 'success');
      fetchData();
    } catch (err) { 
      toast.value?.showToast('Erro ao remover imagem.', 'error'); 
    }
  }
};

const moveHeroUp = async (index) => {
  if (index === 0) return;
  const newOrder = [...heroImages.value];
  [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
  const ids = newOrder.map(img => img._id);
  try {
    await axios.post(`${API_URL}/hero-images/reorder`, { ids });
    toast.value?.showToast('Ordem atualizada!', 'success');
    fetchData();
  } catch (err) { 
    toast.value?.showToast('Erro ao reordenar.', 'error'); 
  }
};

const moveHeroDown = async (index) => {
  if (index === heroImages.value.length - 1) return;
  const newOrder = [...heroImages.value];
  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
  const ids = newOrder.map(img => img._id);
  try {
    await axios.post(`${API_URL}/hero-images/reorder`, { ids });
    toast.value?.showToast('Ordem atualizada!', 'success');
    fetchData();
  } catch (err) { 
    toast.value?.showToast('Erro ao reordenar.', 'error'); 
  }
};

onMounted(fetchData);
</script>

<style scoped>
.admin-page { background: #f8fafc; min-height: 100vh; padding: 30px 20px; font-family: 'Inter', sans-serif; }
.admin-nav { display: flex; justify-content: space-between; max-width: 1200px; margin: 0 auto 30px; align-items: center; }
.nav-brand { display: flex; align-items: center; gap: 12px; }
.brand-icon { background: #E30613; padding: 8px; border-radius: 10px; display: flex; }
.nav-brand h1 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
.nav-brand span { color: #E30613; }
.nav-link { text-decoration: none; color: #64748b; font-weight: 600; font-size: 0.85rem; }

.admin-content { display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px; max-width: 1200px; margin: 0 auto; }
.glass-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 25px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
.header-icon { background: #fee2e2; color: #E30613; padding: 8px; border-radius: 10px; display: flex; }
.header-icon.secondary { background: #f1f5f9; color: #475569; }
.header-icon.info { background: #ecfdf5; color: #10b981; }
.card-header h2 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; }

.modern-form { display: flex; flex-direction: column; gap: 18px; }
.input-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.input-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.input-row { display: flex; gap: 18px; }

input, select, textarea { 
  padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; 
  font-size: 0.95rem; font-family: inherit; transition: all 0.2s; background: #fcfdfe;
}
input:focus, select:focus, textarea:focus { border-color: #E30613; outline: none; box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.05); }

.price-input-wrap { display: flex; align-items: center; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fcfdfe; overflow: hidden; transition: all 0.2s; }
.price-input-wrap:focus-within { border-color: #E30613; box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.05); }
.price-prefix { padding: 0 12px; font-weight: 700; color: #64748b; font-size: 0.95rem; border-right: 1.5px solid #e2e8f0; background: #f1f5f9; height: 100%; display: flex; align-items: center; }
.price-input-wrap input { border: none; box-shadow: none; border-radius: 0; background: transparent; flex: 1; }
.price-input-wrap input:focus { border-color: transparent; box-shadow: none; outline: none; }

.upload-container { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 20px; }
.upload-box { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: #64748b; font-weight: 600; }
.image-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px; margin-top: 20px; }
.preview-card { position: relative; width: 70px; height: 70px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
.preview-card img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-img { position: absolute; top: 4px; right: 4px; background: #E30613; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; }

.form-actions { display: flex; gap: 12px; margin-top: 10px; }
.btn-primary { background: #E30613; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; flex: 1; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px; }

.count-tag { background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-left: 8px; vertical-align: middle; }

.list-controls { display: flex; gap: 10px; margin-bottom: 18px; align-items: stretch; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.list-search-input { width: 100%; padding: 10px 36px 10px 36px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fcfdfe; font-size: 0.9rem; }
.list-search-input:focus { border-color: #E30613; outline: none; box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.05); }
.clear-search { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #e2e8f0; color: #475569; border: none; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 14px; line-height: 1; }
.list-sort { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fcfdfe; font-size: 0.9rem; font-family: inherit; cursor: pointer; }
.list-empty { text-align: center; color: #94a3b8; padding: 30px 10px; font-size: 0.9rem; }

.product-list-item { display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; padding: 15px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
.hidden-item { opacity: 0.5; background: #f1f5f9; border-left: 4px solid #64748b; }
.item-main-info { display: flex; align-items: center; gap: 12px; }
.miniature-container { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
.miniature { width: 100%; height: 100%; object-fit: cover; }
.tag-hidden { background: #64748b; color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 4px; margin-left: 5px; }
.text-details { display: flex; flex-direction: column; gap: 4px; }
.meta-info { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.topic-tag { background: #f1f5f9; color: #475569; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
.badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; }
.badge.venda { background: #dcfce7; color: #166534; }
.badge.aluguel { background: #dbeafe; color: #1e40af; }
.stock-label { font-size: 0.75rem; color: #64748b; }
.stock-label.zero { color: #ef4444; font-weight: 800; }

.item-btns { display: flex; gap: 4px; }
.btn-icon { background: white; border: 1.5px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; color: #64748b; transition: 0.2s; }
.btn-icon:hover { border-color: #E30613; color: #E30613; }
.btn-icon.delete:hover { border-color: #fecaca; color: #ef4444; }

.toggle-switch { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.label-text { font-size: 0.85rem; font-weight: 700; color: #475569; }

.feedback-footer { display: flex; flex-direction: column; gap: 8px; }
.feedback-list { margin-top: 20px; }
.feedback-item { background: #fcfdfe; padding: 15px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
.f-header { display: flex; justify-content: space-between; align-items: center; }
.stars { color: #f59e0b; font-weight: 800; }
.f-text { font-size: 0.9rem; color: #475569; margin: 8px 0; }
.f-actions-modern { display: flex; gap: 8px; }
.btn-mini { background: #f1f5f9; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #64748b; cursor: pointer; }
.btn-mini.delete:hover { background: #fee2e2; color: #ef4444; }

@media (max-width: 900px) {
  .admin-page { padding: 0 0 40px; }

  .admin-nav {
    padding: 12px 16px;
    margin-bottom: 0;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-brand h1 { font-size: 1rem; }

  .admin-content {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 12px;
  }

  .glass-card {
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .input-row {
    flex-direction: column;
    gap: 14px;
  }

  .product-list-item {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
  }

  .item-main-info { flex: 1; min-width: 0; }

  .text-details strong {
    font-size: 0.85rem;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .item-btns { margin-left: auto; }

  .btn-primary, .btn-cancel { padding: 14px; font-size: 0.9rem; }

  .form-actions { flex-direction: column-reverse; }
  .btn-cancel { width: 100%; }
}

/* Hero Images Styles */
.header-icon.hero-icon { background: #fef3c7; color: #f59e0b; }
.upload-container.compact { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.upload-box.small { padding: 10px; font-size: 0.8rem; }
.hero-preview.small { width: 100%; border-radius: 8px; overflow: hidden; }
.hero-preview.small img { width: 100%; height: auto; display: block; max-height: 80px; object-fit: cover; }
.hero-list { margin-top: 15px; }
.hero-item.compact { display: flex; align-items: center; gap: 8px; background: #fcfdfe; padding: 8px; border-radius: 8px; margin-bottom: 6px; border: 1px solid #f1f5f9; }
.hero-thumb { width: 50px; height: 35px; object-fit: cover; border-radius: 6px; }
.hero-info { flex: 1; }
.hero-alt { font-size: 0.75rem; color: #1e293b; }
.hero-actions { display: flex; gap: 2px; }
.hero-actions .btn-icon { padding: 4px; }
.list-empty.small { padding: 12px; font-size: 0.8rem; }
</style>
