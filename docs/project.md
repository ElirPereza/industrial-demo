Propuesta de Mejoras – Segunda Fase
Documento de Requerimientos Funcionales por Módulos
1. Módulo de Gestión Centralizada de Formularios y Envíos
1.1 Descripción
Centralizar el diligenciamiento, envío, almacenamiento y consulta de formularios directamente dentro del portal web, eliminando la dependencia de servicios externos (Google u otros).
________________________________________
1.2 Requerimientos Funcionales
RF-01. Diligenciamiento de formularios desde el portal
•	El sistema debe permitir a los usuarios diligenciar formularios directamente desde el portal web.
•	El acceso podrá ser vía login o vía código QR según configuración.
RF-02. Almacenamiento de envíos
•	Cada formulario enviado debe almacenarse en base de datos.
•	Los datos deben incluir:
o	Contenido del formulario
o	Usuario que diligenció
o	Fecha y hora
o	Área / equipo asociado
RF-03. Panel de consulta de formularios enviados
•	El sistema debe contar con un panel administrativo para consultar los formularios diligenciados.
•	Debe permitir filtros por:
o	Fecha (rango)
o	Área
o	Equipo
o	Autor / técnico
o	Tipo de formulario
________________________________________
1.3 Criterios de Aceptación
•	Un usuario puede diligenciar y enviar un formulario sin salir del portal.
•	Los envíos quedan almacenados y visibles en el panel administrativo.
•	El administrador puede filtrar y encontrar registros específicos.
•	No se utiliza ningún servicio externo para el envío o almacenamiento.
________________________________________
2. Módulo de Constructor Dinámico de Formularios
2.1 Descripción
Permitir la creación, edición y configuración de formularios sin modificar código, mediante una interfaz gráfica.
________________________________________
2.2 Requerimientos Funcionales
RF-04. Constructor visual de formularios
•	El sistema debe permitir crear formularios mediante una interfaz gráfica.
•	Tipos de campos mínimos:
o	Texto corto
o	Texto largo
o	Numérico
o	Fecha
o	Selección única
o	Selección múltiple
o	Firma digital
o	Evidencia fotográfica (si aplica)
RF-05. Edición de formularios existentes
•	Los formularios deben poder editarse sin afectar los registros históricos.
•	Los cambios aplican solo a nuevos diligenciamientos.
RF-06. Versionamiento de formularios
•	El sistema debe mantener versiones de cada formulario.
•	Cada envío debe quedar asociado a la versión del formulario utilizada.
________________________________________
2.3 Criterios de Aceptación
•	Un administrador puede crear un formulario sin tocar código.
•	Un formulario editado no altera registros históricos.
•	El sistema identifica qué versión del formulario fue utilizada en cada registro.
________________________________________
3. Módulo de Administración de Formularios (Gestión en Tiempo Real)
3.1 Descripción
Gestionar formularios activos sin reiniciar el sistema ni afectar la operación.
________________________________________
3.2 Requerimientos Funcionales
RF-07. Activación y desactivación de formularios
•	Los formularios pueden activarse o desactivarse en tiempo real.
•	Un formulario desactivado no puede ser diligenciado.
RF-08. Eliminación lógica de formularios
•	La eliminación no borra registros históricos.
•	Solo impide nuevos usos.
RF-09. Asociación de formularios a áreas/equipos
•	Los formularios pueden asignarse a:
o	Áreas
o	Tipos de equipo
o	Procesos específicos
________________________________________
3.3 Criterios de Aceptación
•	Los formularios pueden gestionarse sin reiniciar el sistema.
•	Un formulario desactivado deja de estar disponible inmediatamente.
•	Los registros históricos permanecen intactos.
________________________________________
4. Módulo de Generación y Gestión de Códigos QR
4.1 Descripción
Automatizar la generación y gestión de códigos QR para acceso a formularios.
________________________________________
4.2 Requerimientos Funcionales
RF-10. Generación automática de QR
•	Al crear un formulario, el sistema debe generar automáticamente su código QR.
•	El QR debe apuntar al formulario correcto y activo.
RF-11. Consulta y descarga de QR
•	El administrador puede visualizar y descargar el QR en cualquier momento.
•	El QR debe mantenerse estable mientras el formulario esté activo.
________________________________________
4.3 Criterios de Aceptación
•	Cada formulario tiene un QR único.
•	El QR redirige correctamente al formulario correspondiente.
•	No se requieren herramientas externas para generar QR.
________________________________________
5. Módulo de Firma Digital y Trazabilidad Técnica
5.1 Descripción
Garantizar la trazabilidad legal y operativa de las acciones realizadas por técnicos.
________________________________________
5.2 Requerimientos Funcionales
RF-12. Firma digital del técnico
•	Cada formulario debe permitir la firma digital del técnico.
•	La firma debe almacenarse junto al registro.
RF-13. Captura de metadatos
•	El sistema debe registrar automáticamente:
o	Fecha y hora exacta
o	Ubicación (si el dispositivo lo permite)
o	Usuario autenticado
RF-14. Inmutabilidad del registro
•	Una vez firmado, el registro no puede ser modificado.
________________________________________
5.3 Criterios de Aceptación
•	Cada registro firmado muestra firma, fecha, hora y ubicación.
•	No es posible alterar un formulario firmado.
•	El registro es auditable.
________________________________________
6. Módulo de Histórico por Equipo (Auditoría)
6.1 Descripción
Permitir una vista completa del historial de intervenciones por equipo.
________________________________________
6.2 Requerimientos Funcionales
RF-15. Histórico por equipo
•	El sistema debe mostrar todos los formularios asociados a un equipo.
•	Ordenados cronológicamente.
RF-16. Ficha del equipo
•	Cada equipo debe contar con una ficha que incluya:
o	Historial de mantenimientos
o	Fallas reportadas
o	Técnicos involucrados
________________________________________
6.3 Criterios de Aceptación
•	Un supervisor puede ver todo el historial de un equipo.
•	La información es clara, ordenada y trazable.
________________________________________
7. Módulo de Analítica y Estadísticas para Supervisión
7.1 Descripción
Proveer información estratégica para supervisores mediante indicadores y tendencias.
________________________________________
7.2 Requerimientos Funcionales
RF-17. Tendencias de fallas
•	El sistema debe identificar:
o	Tipos de fallas más frecuentes
o	Periodos con mayor incidencia
RF-18. Equipos más intervenidos
•	Identificar los equipos con mayor número de procesos/intervenciones.
RF-19. Dashboard de supervisor
•	Dashboard con indicadores clave:
o	Formularios diligenciados por periodo
o	Técnicos más activos
o	Equipos críticos
o	Tendencias de falla
________________________________________
7.3 Criterios de Aceptación
•	El supervisor visualiza métricas sin exportar datos.
•	Las estadísticas se actualizan automáticamente.
•	La información es clara y accionable.
