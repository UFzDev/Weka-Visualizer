# Glosario de Métricas - Weka Visualizer

> [!NOTE]
> Estas 12 métricas se aplican de forma consistente tanto en la **Comparativa Local** (entre dos algoritmos) como en la **Comparativa Global** (todos los algoritmos de la sesión).

1. **Precisión (%)**: Porcentaje total de instancias clasificadas correctamente por el modelo.
2. **Estadística Kappa**: Mide la concordancia entre la predicción y el valor real, eliminando la probabilidad de aciertos por azar.
3. **Error Absoluto (MAE)**: Promedio de la diferencia absoluta entre el valor predicho y el valor real.
4. **Error Cuadrático Medio (RMSE)**: Raíz del promedio de los errores cuadrados; penaliza más los errores de gran magnitud.
5. **Error Absoluto Relativo (RAE)**: Error acumulado comparado con el error de un modelo que solo predice la media aritmética.
6. **Error Cuadrático Relativo (RRSE)**: Similar al RAE pero utilizando la raíz del error cuadrático; es una métrica de error estadística muy exigente.
7. **Área ROC Promedio**: Muestra la capacidad del modelo para separar o distinguir entre las diferentes clases (0.5 es azar, 1.0 es perfecto).
8. **Área PRC Promedio**: Métrica de precisión y exhaustividad, especialmente útil cuando una clase tiene muchísimos más ejemplos que otra.
9. **Coef. Matthews (MCC)**: Coeficiente de correlación entre la clasificación real y la predicha. Oscila entre -1 (total desacuerdo) y +1 (predicción perfecta).
10. **Medida F (F-Measure)**: Balance (media armónica) entre la capacidad de no dar falsos positivos (Precisión) y de no omitir casos reales (Recall).
11. **Tiempo Construcción (s)**: Tiempo total que el algoritmo tardó en generar el modelo a partir de los datos de entrenamiento.
12. **Tiempo Validación (s)**: Tiempo que el modelo tardó en procesar y evaluar los datos proporcionados para el test.
