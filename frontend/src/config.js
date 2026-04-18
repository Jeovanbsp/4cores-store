// URL base da API. Em produção (Vercel) e em mobile, sempre cai no backend público.
// Para desenvolvimento local, defina VITE_API_URL=http://localhost:5000/api em frontend/.env.local
export const API_URL = import.meta.env.VITE_API_URL || 'https://fourcores-api.onrender.com/api'
