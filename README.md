# IRENA - Proyecto Fullstack

##  Descripción
[Agrega aquí una breve descripción de tu proyecto]

##  Stack Tecnológico

### Frontend
- **React 19** con Vite 7
- **TypeScript 5.8**
- **Tailwind CSS** para estilos
- **Material-UI (MUI)** componentes
- **Three.js** para gráficos 3D
- **React Router** para navegación
- **Axios** para API calls

### Backend
- **Python 3.11+**
- **FastAPI 0.104** framework
- **PostgreSQL** con psycopg2-binary
- **SQLAlchemy 2.0** ORM
- **Pydantic 2.5** validación de datos
- **Uvicorn** servidor ASGI

### AI/Chatbot
- **Google Gemini API** integración

##  Estructura del Proyecto

```
IRENA/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── static/
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend Setup

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Crear entorno virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate     # Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones:
   # - DATABASE_URL
   # - SECRET_KEY
   # - GEMINI_API_KEY
   ```

5. **Ejecutar migraciones:**
   ```bash
   # Comando específico según tu configuración
   ```

6. **Iniciar servidor de desarrollo:**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. **Navegar al directorio frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   # Configurar:
   # VITE_API_URL=http://localhost:8000
   # VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## URLs de Desarrollo

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

##  Variables de Entorno

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
DEBUG=True
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## 🚀 Deployment

[Agregar instrucciones de deployment según tu plataforma]

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request



##  Autor

isaias castro