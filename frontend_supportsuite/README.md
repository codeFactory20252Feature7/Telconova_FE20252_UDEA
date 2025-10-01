# TelcoNova Support Suite

Sistema completo de gestión y asignación de técnicos para órdenes de servicio.

## 📋 Descripción

TelcoNova Support Suite es una aplicación web moderna diseñada para la gestión eficiente de órdenes de servicio y la asignación inteligente de técnicos. El sistema incluye autenticación segura, filtros avanzados, persistencia de datos y una interfaz responsive y accesible.

## 🚀 Características Principales

### ✅ Sistema de Autenticación
- Login seguro con validación de credenciales
- Política de bloqueo: 3 intentos fallidos = 15 minutos de bloqueo
- Contador en tiempo real del tiempo de bloqueo
- Persistencia de estado de autenticación

### 📊 Gestión de Órdenes
- Vista completa de órdenes de servicio
- Búsqueda por ID, servicio, zona o descripción
- Creación de nuevas órdenes con formulario validado
- Estados de asignación visual (asignado/no asignado)

### 👥 Selección de Técnicos
- Lista filtrable de técnicos disponibles
- Filtros por: zona, especialidad, carga de trabajo, disponibilidad horaria
- Búsqueda en tiempo real (300ms debounce)
- Gestión de cargas de trabajo (0/5 a 5/5)
- Asignación/reasignación con opción de deshacer (5 segundos)

### 🎨 Diseño y Accesibilidad
- Interfaz moderna basada en el sistema de diseño TelcoNova
- Responsive design (mobile-first)
- Navegación por teclado completa
- Roles ARIA y etiquetas descriptivas
- Contraste de colores WCAG AA
- Estados de focus visibles
- Soporte para screen readers

## 🛠 Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS con sistema de diseño personalizado
- **Componentes**: Shadcn/ui con variantes personalizadas
- **Estado**: React Hooks + localStorage para persistencia
- **Build**: Vite
- **Íconos**: Lucide React

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 16+ y npm (instalar con [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/DanielJimenez0429/telconova-supportsuite.git
cd telconova-supportsuite

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# La aplicación estará disponible en http://localhost:8080
```

### Para producción

```bash
# Construir para producción
npm run build

# Vista previa de build
npm run preview
```

## 🔑 Credenciales de Prueba

**Supervisor por defecto:**
- **Email**: `supervisor@example.com`
- **Contraseña**: `Admin123.`

## 📦 Despliegue en Vercel

### Opción 1: Desde el repositorio
1. Conecta tu cuenta de GitHub con Vercel
2. Importa este repositorio en Vercel
3. Vercel detectará automáticamente que es un proyecto Vite
4. Haz clic en "Deploy"

### Opción 2: Desde archivos locales
1. Ejecuta `npm run build` para crear la carpeta `dist`
2. Sube los archivos de la carpeta `dist` a Vercel
3. Configura `index.html` como entrada principal

### Configuración de dominio personalizado
1. Ve a tu proyecto en Vercel
2. Navega a Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

## 🗃 Arquitectura de Datos

### Almacenamiento Local
Los datos se persisten en `localStorage` con las siguientes claves:

- `telcoNova_auth`: Estado de autenticación y bloqueos
- `telcoNova_auth_attempts`: Historial de intentos de login
- `telcoNova_technicians`: Lista de técnicos con cargas de trabajo
- `telcoNova_orders`: Lista de órdenes y asignaciones

### Estructura de Datos

```typescript
// Técnico
interface Technician {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  zona: string;
  especialidad: string;
  carga: number; // 0-5
  disponibilidad: string[]; // ['00:00-06:00', ...]
}

// Orden
interface Order {
  id: string;
  zona: string;
  creadoEn: string; // ISO timestamp
  servicio: string;
  descripcion: string;
  assignedTo?: string; // technician id
}
```

## 🧪 Testing Manual

### Test de Autenticación
1. **Login exitoso**: Usar credenciales correctas
2. **Login fallido**: Intentar 3 veces con credenciales incorrectas
3. **Bloqueo**: Verificar que se bloquea por 15 minutos
4. **Persistencia**: Refrescar página y verificar estado

### Test de Órdenes
1. **Búsqueda**: Buscar por ID, servicio, zona
2. **Creación**: Crear nueva orden con todos los campos
3. **Asignación**: Asignar técnico y verificar cambio de estado
4. **Reasignación**: Cambiar técnico asignado

### Test de Técnicos
1. **Filtros**: Probar cada filtro individualmente y combinado
2. **Búsqueda**: Buscar por nombre, email, teléfono
3. **Disponibilidad**: Verificar que técnicos con carga 5/5 no sean seleccionables
4. **Deshacer**: Probar función de deshacer asignación

## 🔧 Utilidades de Desarrollo

### Resetear datos a estado inicial
```javascript
// En la consola del navegador
import { developmentUtils } from '/src/lib/storage.js';
developmentUtils.resetAllData();
```

### Verificar estado de autenticación
```javascript
// En la consola del navegador
localStorage.getItem('telcoNova_auth');
```

## 📱 Responsive Breakpoints

- **Mobile**: ≤640px
- **Tablet**: 641px - 1024px  
- **Desktop**: >1024px

## 🎯 Funcionalidades Futuras

- **Asignación Automática**: Algoritmo inteligente de asignación
- **Reportes**: Dashboard con métricas y estadísticas
- **Notificaciones**: Sistema de notificaciones push
- **API Integration**: Conexión con backend real
- **Geolocalización**: Asignación basada en ubicación GPS

## 🐛 Solución de Problemas

### La aplicación no carga
- Verificar que Node.js esté instalado correctamente
- Ejecutar `npm install` para instalar dependencias
- Verificar que el puerto 8080 esté disponible

### Los datos no se persisten
- Verificar que localStorage esté habilitado en el navegador
- Comprobar que no esté en modo incógnito
- Revisar la consola para errores de JavaScript

### Problemas de estilos
- Ejecutar `npm run build` para regenerar CSS
- Verificar que Tailwind CSS esté configurado correctamente
- Refrescar la página y limpiar caché

## 📄 Licencia

Este proyecto está desarrollado para TelcoNova. Todos los derechos reservados.

## 👨‍💻 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo de TelcoNova.
