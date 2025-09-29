# Hotel Villa Angelina - Sistema de Gestión

Una aplicación web progresiva (PWA) para la gestión profesional del Hotel Villa Angelina, integrada con Firebase Realtime Database para sincronización en tiempo real entre múltiples dispositivos.

## 🚀 Despliegue en GitHub Pages

### Archivos necesarios para subir a tu repositorio

1. index.html - Página principal de la aplicación
2. firebase-config.js - Configuración e integración con Firebase
3. app.js - Lógica principal de la aplicación
4. manifest.json - Configuración PWA
5. sw.js - Service Worker para funcionalidad offline
6. database-rules.json - Reglas de seguridad para Firebase (solo referencia)
7. README.md - Este archivo de documentación

### Pasos para el despliegue

#### 1. Crear repositorio en GitHub
```bash
# Crear nuevo repositorio en GitHub llamado hotel-villa-angelina
# O usar repositorio existente
```

#### 2. Configurar Firebase Realtime Database
1. Ve a [Firebase Console](httpsconsole.firebase.google.com)
2. Busca tu proyecto app--hotel-villa-angelina
3. Ve a Realtime Database  Reglas
4. Copia y pega el contenido de `database-rules.json`
5. Haz clic en Publicar

#### 3. Subir archivos al repositorio
```bash
git clone httpsgithub.comTU_USUARIOhotel-villa-angelina.git
cd hotel-villa-angelina

# Copia todos los archivos al directorio
# Luego
git add .
git commit -m Initial deployment of Hotel Villa Angelina
git push origin main
```

#### 4. Habilitar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Settings  Pages
3. Source Deploy from a branch
4. Branch main   (root)
5. Haz clic en Save

#### 5. Acceder a la aplicación
Tu aplicación estará disponible en
```
httpsTU_USUARIO.github.iohotel-villa-angelina
```

## ✨ Funcionalidades

### 📱 Características principales
- Móvil-first Diseñado específicamente para dispositivos móviles
- Tiempo real Sincronización instantánea entre múltiples dispositivos
- PWA Instalable como aplicación nativa
- Offline Funcionalidad básica sin conexión

### 💰 Gestión de Ingresos
- Registro de huéspedes Check-incheck-out con cálculo automático de noches
- Registro de ventas Productos predefinidos con precios actualizables
- Cálculo automático Totales en tiempo real

### 💸 Gestión de Gastos
- Registro libre Conceptos personalizables
- Fechas y notas Control detallado de gastos
- Categorización Sistema simple y efectivo

### 📊 Consulta de Balance
- Resumen ejecutivo Ingresos, gastos y balance neto
- Información detallada Listas completas de transacciones
- Período actual Filtrado por mes actual (ampliable)

### ⚙️ Administración
- Gestión de productos Añadir, editar y eliminar productos
- Reset manual Limpieza de datos con confirmación
- Configuración Ajustes de reset automático

## 🎯 Productos Iniciales

La aplicación incluye 24 productos predefinidos

 Producto  Precio (COP) 
------------------------
 Agua brisa 600mL  2.000 
 Agua cristal 300mL  800 
 Arranca muela  200 
 Chao  100 
 Choki  2.000 
 Coca cola 1.5L  7.000 
 Coca cola 400ml  3.000 
 Cola roman 1.5L  5.000 
 Colgate pequeño  2.500 
 Desodorante balan  1.500 
 Detodito  3.000 
 Dorito  2.800 
 Jugo del valle 1.5L  5.000 
 Mamut  500 
 Manimoto cronch  1.800 
 Maní moto salado  1.200 
 Margaritas  2.800 
 Pan aliñado (500)  500 
 Pan aliñado (1000)  1.000 
 Pan de queso  1.000 
 Savital acondicionador  1.500 
 Savital shampo  1.500 
 Sepillo de diente  2.000 
 Súper coco  200 

## 🔧 Configuración técnica

### Firebase Realtime Database
- Autenticación Anónima (automática)
- Estructura de datos Optimizada para consultas rápidas
- Reglas de seguridad Validación completa de tipos y rangos
- Sincronización Tiempo real entre dispositivos

### Tecnologías utilizadas
- Frontend HTML5, CSS3, JavaScript ES6+
- Backend Firebase Realtime Database
- PWA Service Worker, Web App Manifest
- UIUX Mobile-first, animations, responsive design

## 📱 Uso de la aplicación

### Flujo básico
1. Abrir aplicación → Autenticación automática
2. Registrar ingreso → Huésped o Venta
3. Registrar gasto → Concepto libre
4. Consultar balance → Resumen + detalles
5. Administrar productos → CRUD completo

### Multi-dispositivo
- Los datos se sincronizan automáticamente
- Varios usuarios pueden usar la app simultáneamente
- Actualizaciones en tiempo real en todas las pantallas

## 🛡️ Seguridad

- Autenticación requerida Solo usuarios autenticados pueden acceder
- Validación de datos Tipos, rangos y formatos validados
- Reglas Firebase Protección a nivel de base de datos
- Sanitización Prevención de inyección de código

## 🔄 Mantenimiento

### Reset de datos
- Manual Botón con confirmación doble
- Automático Configurable por día del mes
- Productos Se mantienen siempre (no se borran)

### Backup
- Los datos se almacenan en Firebase (respaldados automáticamente)
- Exportación manual disponible (función expandible)

## 📞 Soporte

Para soporte técnico o modificaciones, contacta al desarrollador.

### Estructura de archivos final
```
hotel-villa-angelina
├── index.html              # Página principal
├── firebase-config.js      # Configuración Firebase
├── app.js                  # Lógica de la aplicación
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker
├── database-rules.json     # Reglas de Firebase (referencia)
└── README.md              # Documentación
```

---

Hotel Villa Angelina - Sistema de Gestión Profesional 🏨