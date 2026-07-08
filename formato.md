# Formato del JSON de preguntas

La app lee un archivo JSON con un titulo, una descripcion opcional y una lista de preguntas de opcion multiple.

## Estructura

```json
{
  "titulo": "Nombre del cuestionario",
  "descripcion": "Texto breve opcional para mostrar antes del examen.",
  "preguntas": [
    {
      "pregunta": "Texto de la pregunta",
      "opciones": [
        "Primera opcion",
        "Segunda opcion",
        "Tercera opcion"
      ],
      "respuesta": 1,
      "explicacion": "Texto opcional que aparece si se corrige el examen."
    }
  ]
}
```

## Reglas

- `titulo`: texto que se muestra arriba del cuestionario.
- `descripcion`: texto opcional para explicar el examen.
- `preguntas`: lista de preguntas. Puede tener una o muchas.
- `pregunta`: texto de la consigna.
- `opciones`: lista de respuestas posibles. Debe tener al menos 2 opciones.
- `respuesta`: numero de la opcion correcta, contando desde `0`.
- `explicacion`: texto opcional para repasar luego de corregir.

Importante: si la opcion correcta es la primera, `respuesta` debe ser `0`; si es la segunda, `1`; si es la tercera, `2`.

## Ejemplo completo

```json
{
  "titulo": "Psicologia - parcial 1",
  "descripcion": "Practica de conceptos basicos.",
  "preguntas": [
    {
      "pregunta": "Que es una variable independiente?",
      "opciones": [
        "La variable que se manipula o compara",
        "La variable que siempre queda igual",
        "El resultado que se mide",
        "Una opinion del investigador"
      ],
      "respuesta": 0,
      "explicacion": "La variable independiente es la que se manipula o se usa para comparar grupos."
    },
    {
      "pregunta": "Que representa la memoria de trabajo?",
      "opciones": [
        "Un deposito permanente e ilimitado",
        "Un sistema temporal para mantener y manipular informacion",
        "Un reflejo automatico",
        "Una tecnica de entrevista clinica"
      ],
      "respuesta": 1
    }
  ]
}
```

La app lee siempre el archivo `preguntas.json` desde la carpeta raiz del proyecto. Para cambiar las preguntas, edita ese archivo manteniendo este formato.
