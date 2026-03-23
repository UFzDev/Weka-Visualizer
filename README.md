# 📊 Weka Visualizer: Advanced ML Dashboard

Weka Visualizer es una solución de alto rendimiento diseñada para la transformación inmediata de reportes de texto plano de **Weka Machine Learning** en dashboards interactivos de alta fidelidad. 

Este motor elimina la fricción operativa al interpretar métricas densas, permitiendo un análisis granular del rendimiento de modelos predictivos mediante una interfaz moderna y reactiva.

---

## ✨ Características de Ingeniería

*   **Smart Parsing Engine:** Extracción automatizada de métricas mediante expresiones regulares (Regex) optimizadas para el output estándar de Weka.
*   **Visualización Dinámica:** Generación de gráficas interactivas para *Precision*, *Recall*, *F-Measure* y *Accuracy*.
*   **Matriz de Confusión Reactiva:** Mapa de calor (Heatmap) integral para la identificación visual de sesgos y errores de clasificación.
*   **Análisis Train vs. Test:** Auditoría comparativa dedicada para la detección temprana de anomalías como el *overfitting*.
*   **Enterprise Export:** Generación de reportes listos para documentación técnica de grado profesional.

---

## 🚀 Arquitectura y Stack Tecnológico

La aplicación ha sido diseñada bajo principios de escalabilidad y rendimiento:

*   **Core Logic:** TypeScript con tipado estricto para garantizar la integridad de los datos procesados.
*   **Framework UI:** Vite + React (Arquitectura de componentes modulares).
*   **Data Visualization:** Chart.js / Recharts para renderizado ligero en el lado del cliente.
*   **Estilos:** Vanilla CSS con Design Tokens optimizados para *Dark Mode* y accesibilidad (fluid typography).
*   **Deployment:** Optimizado para despliegues rápidos en entornos Vercel/Netlify.

---

## 🛠️ Guía de Inicio Rápido

### Instalación de Dependencias

```bash
# Instalación con Bun o NPM
bun install
# o
npm install
```

### Ejecución en Desarrollo

```bash
npm run dev
```

### Proceso de Análisis

1.  **Entrena:** Ejecuta tu clasificador en Weka (k-NN, Naive Bayes, J48, etc.).
2.  **Copia:** Selecciona el `Classifier Output` en Weka.
3.  **Pega:** Introduce el bloque de texto en el selector correspondiente.
4.  **Analiza:** Explora los indicadores de rendimiento en tiempo real.

---

## 📈 Métricas de Referencia

La precisión global se valida mediante la fórmula estándar de clasificación multiclase:

$$\text{Accuracy} = \frac{\sum \text{Clasificados Correctamente}}{\sum \text{Total de Instancias}}$$

---

## 🤝 Contribución y Soporte

Desarrollado como parte del ecosistema de **Digitalandia**. Ideal para integración en flujos de trabajo académicos y profesionales que requieren una capa de visualización sobre herramientas de minería de datos tradicionales.

---

> [!NOTE]
> Este proyecto prioriza la estética y la experiencia de usuario (UX Líquida) sin comprometer el rigor técnico del análisis de datos.