<template>
  <div class="admin-page">
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
                <label>Preço (R$)</label>
                <input v-model.number="product.price" type="number" step="0.01" required />
              </div>
              <div class="input-group">
                <label>Estoque</label>
                <input v-model.number="product.stock" type="number" required />
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
            <h2>Itens no Catálogo</h2>
          </div>
          <div class="items-grid">
            <div v-for="p in productsList" :key="p._id" class="product-list-item" :class="{ 'hidden-item': p.visible === false }">
              <div class="item-main-info">
                <div class="miniature-container">
                  <img :src="p.images[0] || 'https://via.placeholder.com/50'" class="miniature" />
                </div>
                <div class="text-details">
                  <strong>{{ p.name }} <span v-if="p.visible === false" class="tag-hidden">OCULTO</span></strong>
                  <div class="meta-info">
                    <span class="topic-tag">{{ p.topic || 'Geral' }}</span>
                    <span class="badge" :class="p.category">{{ p.category }}</span>
                    <span class="stock-label" :class="{ 'zero': p.stock <= 0 }">Qtd: {{ p.stock || 0 }}</span>
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
  LayoutGridIcon, MessageSquareIcon, UploadCloudIcon 
} from 'lucide-vue-next';

const API_URL = "http://localhost:5000/api";
const productsList = ref([]);
const feedbacksList = ref([]);
const editingProduct = ref(null);
const editingFeedback = ref(null);

// Estado do Produto (Ajustado de info para description)
const product = reactive({ 
  name: '', 
  topic: '', 
  price: null, 
  stock: 1, 
  category: 'venda', 
  displayMode: 'single', 
  images: [], 
  description: '', // Sincronizado com Product.js
  visible: true 
});

const feedback = reactive({ name: '', text: '', stars: 5 });

const uniqueTopics = computed(() => {
  const topics = productsList.value.map(p => p.topic).filter(t => t);
  return [...new Set(topics)];
});

const fetchData = async () => {
  try {
    const [pRes, fRes] = await Promise.all([
      axios.get(`${API_URL}/products`),
      axios.get(`${API_URL}/feedbacks`)
    ]);
    productsList.value = pRes.data;
    feedbacksList.value = fRes.data;
  } catch (err) { console.error(err); }
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
    } else {
      await axios.post(`${API_URL}/products`, payload);
    }
    resetProductForm();
    fetchData();
  } catch (err) { alert("Erro ao salvar produto."); }
};

const editProduct = (p) => {
  editingProduct.value = p;
  Object.assign(product, { 
    ...p, 
    visible: p.visible ?? true, 
    description: p.description ?? '' // Sincronizado aqui também
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetProductForm = () => {
  editingProduct.value = null;
  Object.assign(product, { 
    name: '', topic: '', price: null, stock: 1, 
    category: 'venda', displayMode: 'single', images: [], 
    description: '', visible: true 
  });
};

const deleteProduct = async (id) => {
  if (confirm("Excluir item?")) {
    await axios.delete(`${API_URL}/products/${id}`);
    fetchData();
  }
};

const handleFeedbackSubmit = async () => {
  try {
    if (editingFeedback.value) {
      await axios.put(`${API_URL}/feedbacks/${editingFeedback.value._id}`, feedback);
    } else {
      await axios.post(`${API_URL}/feedbacks`, feedback);
    }
    resetFeedbackForm();
    fetchData();
  } catch (err) { console.error(err); }
};

const editFeedback = (f) => { editingFeedback.value = f; Object.assign(feedback, f); };
const resetFeedbackForm = () => { editingFeedback.value = null; Object.assign(feedback, { name: '', text: '', stars: 5 }); };
const deleteFeedback = async (id) => { if (confirm("Excluir?")) { await axios.delete(`${API_URL}/feedbacks/${id}`); fetchData(); } };

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

.upload-container { background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 20px; }
.upload-box { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: #64748b; font-weight: 600; }
.image-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px; margin-top: 20px; }
.preview-card { position: relative; width: 70px; height: 70px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
.preview-card img { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-img { position: absolute; top: 4px; right: 4px; background: #E30613; color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; }

.form-actions { display: flex; gap: 12px; margin-top: 10px; }
.btn-primary { background: #E30613; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; flex: 1; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 10px;}

.product-list-item { display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; padding: 15px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
.hidden-item { opacity: 0.5; background: #f1f5f9; border-left: 4px solid #64748b; }
.miniature-container { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; }
.miniature { width: 100%; height: 100%; object-fit: cover; }
.tag-hidden { background: #64748b; color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 4px; margin-left: 5px; }
.topic-tag { background: #f1f5f9; color: #475569; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; margin-right: 5px; }
.badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; }
.badge.venda { background: #dcfce7; color: #166534; }
.badge.aluguel { background: #dbeafe; color: #1e40af; }
.stock-label { font-size: 0.75rem; color: #64748b; margin-left: 8px; }
.stock-label.zero { color: #ef4444; font-weight: 800; }

.btn-icon { background: white; border: 1.5px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; color: #64748b; margin-left: 5px; transition: 0.2s; }
.btn-icon:hover { border-color: #E30613; color: #E30613; }
.btn-icon.delete:hover { border-color: #fecaca; color: #ef4444; }

.toggle-switch { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.label-text { font-size: 0.85rem; font-weight: 700; color: #475569; }

.feedback-list { margin-top: 20px; }
.feedback-item { background: #fcfdfe; padding: 15px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
.stars { color: #f59e0b; font-weight: 800; }
.f-text { font-size: 0.9rem; color: #475569; margin: 8px 0; }
.f-actions-modern { display: flex; gap: 8px; }
.btn-mini { background: #f1f5f9; border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #64748b; cursor: pointer; }
.btn-mini.delete:hover { background: #fee2e2; color: #ef4444; }

@media (max-width: 900px) { .admin-content { grid-template-columns: 1fr; } }
</style>