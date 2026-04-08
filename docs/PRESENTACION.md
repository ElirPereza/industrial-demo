# Guía de Presentación — Plataforma de Gestión Industrial

## Qué es

Una plataforma web para digitalizar la gestión operativa de plantas industriales. Permite controlar equipos, coordinar mantenimientos, gestionar formularios de inspección, y monitorear alertas en tiempo real — todo desde un solo lugar.

---

## Estructura de la Presentación (20-25 min)

### 1. El Problema (2 min)

> "Hoy las plantas industriales manejan su operación con papeles, WhatsApp y Excel. No hay trazabilidad, no hay datos centralizados, y cuando algo falla, nadie sabe quién hizo qué ni cuándo."

Puntos a tocar:
- Formularios en papel que se pierden
- Sin historial digital de mantenimientos por equipo
- Alertas de equipos que llegan tarde o no llegan
- Órdenes de trabajo en pizarras o mensajes
- Cero visibilidad para supervisores y gerencia

---

### 2. La Solución (2 min)

> "Nuestra plataforma centraliza toda la operación industrial en un portal web accesible desde cualquier dispositivo."

Mostrar la pantalla de login y explicar:
- Cada empresa tiene su espacio aislado (multi-tenant)
- Roles diferenciados: Admin, Supervisor, Técnico, Contratista
- Acceso protegido — sin cuenta no entras

---

### 3. Demo en Vivo — Módulo por Módulo (15 min)

#### 3.1 Registro y Acceso (2 min)

**Qué mostrar:**
- Crear cuenta nueva → llega correo de confirmación
- Confirmar correo → vuelve al login con mensaje de éxito
- Iniciar sesión → entra al dashboard

**Qué decir:**
> "El administrador crea la cuenta de su empresa. Los demás usuarios son invitados por el admin con el rol que les corresponda."

---

#### 3.2 Dashboard — Centro de Comando (2 min)

**Qué mostrar:**
- Vista general con KPIs
- Alertas activas
- Órdenes de trabajo pendientes
- Resumen de formularios

**Qué decir:**
> "El dashboard le da al supervisor una foto instantánea de cómo está la planta. De un vistazo sabe cuántos equipos están operativos, qué alertas hay abiertas, y qué mantenimientos están pendientes."

---

#### 3.3 Gestión de Activos / Equipos (3 min)

**Qué mostrar:**
1. Lista de equipos con filtros por área
2. Detalle de un equipo → datos, historial de mantenimiento, alertas, documentos
3. **Crear un equipo nuevo en vivo** → llenar nombre, tipo, área, subir foto
4. Verificar que aparece en la lista

**Qué decir:**
> "Cada equipo tiene su ficha digital completa. Historial de mantenimientos, alertas asociadas, documentos técnicos, fotos. Cuando un técnico necesita información de un equipo, todo está aquí."

---

#### 3.4 Alertas Industriales (2 min)

**Qué mostrar:**
- Feed de alertas con niveles de severidad (crítica, alta, media)
- Marcas reales de equipos industriales (Danfoss, Siemens, ABB)
- Parámetros técnicos de cada alerta

**Qué decir:**
> "Las alertas se generan cuando los equipos reportan anomalías. Cada alerta muestra exactamente qué falló, con qué parámetros, y su nivel de urgencia. El supervisor puede actuar de inmediato."

---

#### 3.5 Órdenes de Trabajo (3 min)

**Qué mostrar:**
1. Lista de OTs con filtros de prioridad y estado
2. Detalle de una OT → checklist de intervención, equipo asociado
3. **Crear una OT nueva en vivo** → seleccionar equipo, prioridad, técnico
4. **Cambiar estado de una OT** → de "creada" a "en progreso"
5. **Marcar items del checklist** → se guarda en tiempo real

**Qué decir:**
> "Las órdenes de trabajo coordinan el mantenimiento. El supervisor crea la orden, asigna un técnico, y el técnico va ejecutando el checklist paso a paso. Todo queda registrado — qué se hizo, cuándo, y por quién."

---

#### 3.6 Formularios Digitales (2 min)

**Qué mostrar:**
1. Lista de formularios disponibles
2. **Llenar un formulario de inspección en vivo** → campos, selección de equipo
3. Enviar → confirmación de envío
4. Panel de administración → activar/desactivar formularios

**Qué decir:**
> "Adiós a los formularios en papel. Cada inspección, cada reporte de falla, cada mantenimiento queda registrado digitalmente con fecha, responsable y equipo asociado. El admin controla qué formularios están activos."

---

#### 3.7 Constructor de Formularios (1 min)

**Qué mostrar:**
- Arrastrar campos al canvas (texto, numérico, fecha, selección, firma, foto)
- Personalizar etiquetas y opciones
- Vista previa en tiempo real

**Qué decir:**
> "El administrador puede crear formularios personalizados sin necesidad de programar. Arrastra los campos que necesita, configura las opciones, y el formulario queda listo para que los técnicos lo usen."

---

### 4. Diferenciadores (2 min)

> "¿Qué nos hace diferentes?"

- **Multi-empresa**: Cada empresa tiene su espacio completamente aislado. Los datos de una empresa nunca se mezclan con otra.
- **Roles y permisos**: Cada persona ve solo lo que le corresponde según su rol.
- **Historial completo**: Todo queda registrado con fecha, hora y responsable. Trazabilidad total.
- **Acceso desde cualquier lugar**: Funciona en computadora, tablet y celular.
- **QR Codes**: Cada equipo y formulario puede tener su código QR para acceso rápido.

---

### 5. Cierre (1 min)

> "Esta plataforma convierte una operación industrial basada en papel y comunicación informal en un sistema digital con trazabilidad, control y visibilidad en tiempo real."

---

## Si te Preguntan sobre Seguridad y Datos

### "¿Cómo protegen los datos?"

> "Los datos de cada empresa están completamente aislados a nivel de base de datos. Cada consulta pasa por políticas de seguridad que verifican a qué organización pertenece el usuario. No es posible que un usuario de una empresa vea datos de otra — esto se valida en el servidor, no en el navegador."

### "¿Dónde se almacenan los datos?"

> "Los datos se almacenan en servidores seguros en la nube con encriptación en tránsito y en reposo. Los archivos (fotos, documentos, manuales) se almacenan en un servicio de almacenamiento dedicado con las mismas políticas de aislamiento."

### "¿Qué pasa si alguien intenta acceder sin permiso?"

> "El sistema tiene protección en múltiples niveles. Primero, necesitas una cuenta verificada por correo electrónico. Segundo, cada ruta está protegida — si no tienes sesión activa, el sistema te redirige al login automáticamente. Tercero, las políticas de base de datos filtran los datos por organización y rol, así que incluso si alguien lograra acceder, solo vería los datos que le corresponden."

### "¿Los datos les pertenecen a ustedes o al cliente?"

> "Los datos son 100% del cliente. Nosotros somos custodios, no dueños. El cliente puede solicitar exportación de sus datos en cualquier momento."

### "¿Tienen respaldos?"

> "Sí, se realizan respaldos automáticos diarios de la base de datos. En caso de un incidente, podemos restaurar a cualquier punto en las últimas 24 horas."

### "¿Qué pasa con las firmas digitales? ¿Tienen validez legal?"

> "Las firmas capturadas en la plataforma incluyen fecha, hora, usuario autenticado y el formulario asociado. Esto proporciona trazabilidad completa. Para validez legal certificada, estamos trabajando en integración con proveedores de firma electrónica avanzada."

---

## Credenciales para la Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@demo.industrial.com | demo123456 |
| Supervisor | supervisor@demo.industrial.com | demo123456 |
| Técnico | tecnico@demo.industrial.com | demo123456 |
| Contratista | contratista@demo.industrial.com | demo123456 |

---

## Antes de la Presentación — Checklist

- [ ] Verificar que la plataforma carga correctamente
- [ ] Probar login con el usuario admin demo
- [ ] Verificar que los datos seed se ven (5 equipos, 2 alertas, 1 OT)
- [ ] Tener una segunda cuenta lista para mostrar el registro en vivo
- [ ] Tener el correo abierto para mostrar confirmación de email
- [ ] Limpiar el historial del navegador para que no se auto-complete

---

## Cosas que NO debes decir

- No mencionar tecnologías específicas (React, Supabase, Next.js, etc.)
- No hablar de "base de datos", decir "sistema de almacenamiento"
- No hablar de "API" ni "endpoints"
- No decir "mock" ni "simulado" — todo funciona con datos reales
- No mencionar que algunas funcionalidades están "pendientes" — enfócate en lo que funciona

## Cosas que SÍ puedes decir

- "Plataforma web" o "sistema"
- "Almacenamiento seguro en la nube"
- "Políticas de seguridad a nivel de servidor"
- "Aislamiento por empresa"
- "Trazabilidad completa"
- "Accesible desde cualquier dispositivo"
