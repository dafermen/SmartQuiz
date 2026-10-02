# SmartQuiz — Mapa documental y mantenimiento

## DOC-STD-20261002 — Fuentes canónicas

Estándar documental v1.0 · revisión 2026-10-02. Idioma principal: español.

Aplicación de cuestionarios con persistencia local y contenedor móvil.

Mantener el progreso separado por banco y ofrecer exportación antes de borrar almacenamiento. GitHub Pages publica la web; los paquetes móviles tienen su propia validación. Las capturas proceden de docs/images y se copian mediante el generador del portal.

| Necesidad | Fuente oficial |
| --- | --- |
| Presentación | [README.md](../README.md) |
| Estado vigente | [CURRENT_STATUS.md](../CURRENT_STATUS.md) |
| Desarrollo | [docs/DEVELOPMENT.md](DEVELOPMENT.md) |
| Arquitectura | [docs/ARCHITECTURE.md](ARCHITECTURE.md) |
| Uso | [docs/USER_GUIDE.md](USER_GUIDE.md) |
| API / contratos | [docs/API.md](API.md) |
| Pruebas | [docs/TESTING.md](TESTING.md) |
| Seguridad | [docs/SECURITY.md](SECURITY.md) |
| Despliegue | [docs/DEPLOYMENT.md](DEPLOYMENT.md) |
| Operación | [docs/OPERATIONS.md](OPERATIONS.md) |
| Solución de problemas | [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Código | [docs/CODE_MAP.md](CODE_MAP.md) |
| Guía de calidad | [docs/QA_GUIDE.md](QA_GUIDE.md) |
| Historia | [CHANGELOG.md](../CHANGELOG.md) |

Para probar el producto, comenzar por presentación, estado y uso. Para desarrollar, continuar con instalación, arquitectura y pruebas. Para operar, consultar despliegue, seguridad y recuperación. El índice detallado existente conserva su validez.

### Evidencia y actualización

Separar estado vigente, historia y decisiones. Los resultados de pruebas fechados conservan su valor histórico. Este mapa no vuelve a ejecutar todos los comandos documentados ni cierra la aceptación pendiente del producto. Registrar las comprobaciones realmente ejecutadas, su entorno y sus límites antes de publicar.

Actualizar la guía de origen al cambiar comandos, configuración, comportamiento, permisos o despliegue. Mantener enlaces y rutas del portal. Usar capturas reales con datos sintéticos; nunca publicar valores de .env, claves, datos de usuarios ni logs operativos. Un commit local, un commit remoto y un artefacto desplegado son estados diferentes.
