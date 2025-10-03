# CV Online - Guido Delponte

Un CV interactivo y profesional construido con React, Vite y Tailwind CSS siguiendo las mejores prácticas de desarrollo.

## ✨ Características

- **Diseño Responsive**: Optimizado para desktop, tablet y móvil
- **Tema Oscuro/Claro**: Cambio dinámico de tema con persistencia
- **Impresión Optimizada**: Estilos específicos para impresión
- **Performance**: Componentes optimizados y lazy loading
- **Accesibilidad**: Cumple estándares WCAG
- **Código Limpio**: Arquitectura modular siguiendo principios DRY

## 🚀 Tecnologías

- **React 18** - Biblioteca principal
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **ESLint** - Linting y calidad de código

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes generales
│   │   ├── layout/      # Componentes de layout (Section)
│   │   └── ui/          # Componentes de UI (Button, Card, etc.)
│   └── cv/              # Componentes específicos del CV
├── constants/           # Constantes y configuración
├── hooks/               # Custom hooks (useTheme, useBreakpoint, etc.)
└── assets/              # Recursos estáticos (imágenes)
```

## 🛠️ Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linting
npm run lint
```

## 📋 Características Técnicas

### Arquitectura
- **Componentes funcionales** con hooks
- **Principio DRY** aplicado consistentemente
- **Separación de responsabilidades** clara
- **Reutilización de código** maximizada

### Performance
- **Lazy loading** para componentes
- **Memoización** de cálculos costosos
- **Optimización de re-renders**
- **Bundle splitting** automático

### Styling
- **Sistema de diseño** consistente
- **Clases utilitarias** reutilizables
- **Tema dinámico** con CSS custom properties
- **Responsive design** mobile-first

### Desarrollo
- **TypeScript-ready** (tipos mediante JSDoc)
- **ESLint** configurado
- **Hot reload** rápido
- **Debugging** optimizado

## 🎨 Personalización

### Colores y Temas
Los colores y temas se pueden personalizar en `src/constants/styles.js`:

```javascript
export const TECH_COLORS = {
  blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  // ... más colores
};
```

### Datos del CV
Toda la información se centraliza en `src/constants/cv.js`:

```javascript
export const cvData = {
  header: { /* ... */ },
  contact: { /* ... */ },
  // ... más secciones
};
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navegación adaptativa**: Tabs en móvil, sidebar en desktop

## 🖨️ Funcionalidad de Impresión

- **Estilos optimizados** para impresión
- **Ocultar elementos** no necesarios
- **Layout específico** para papel
- **Botón de impresión** integrado

## 🔧 Mejoras Implementadas

1. **Refactorización de componentes** para mayor reutilización
2. **Sistema de constantes** centralizado
3. **Hooks personalizados** para lógica compleja
4. **Utilidades mejoradas** con manejo de errores
5. **Arquitectura modular** más mantenible
6. **Performance optimizada** con lazy loading
7. **Tipado implícito** con validaciones
8. **Documentación completa** del código

## 📄 Licencia

MIT - Ver archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado por Guido Delponte** - [GitHub](https://github.com/GDelpo)
