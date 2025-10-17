# Bot de Modmail para Discord

Este proyecto implementa un bot de modmail en Discord con soporte para:

- Creación automática de canales privados cuando un usuario envía un DM al bot.
- Reenvío de mensajes y adjuntos entre el usuario y el equipo de moderación.
- Transferencia de tickets a otras categorías del servidor.
- Asignación de tickets a miembros concretos del staff.
- Cierre del ticket con notificación al usuario.
- Preparado para desplegarse fácilmente en Railway sin exponer el token en el código.

## Requisitos

- Node.js 18.17 o superior.
- Un bot registrado en [Discord Developer Portal](https://discord.com/developers/applications) con intents de **Message Content**, **Server Members** y **Direct Messages** habilitados.
- Un servidor (guild) de Discord donde el bot tenga permisos para administrar canales y enviar mensajes.

## Variables de entorno

Configura las siguientes variables en tu entorno local o como **Secrets** en Railway:

| Variable | Descripción |
| --- | --- |
| `DISCORD_TOKEN` | Token del bot de Discord. **No lo escribas en el código**. |
| `CLIENT_ID` | ID de la aplicación/bot. Necesario para registrar comandos. |
| `GUILD_ID` | ID del servidor donde operará el modmail. |
| `MODMAIL_CATEGORY_ID` | ID de la categoría donde se crearán los canales de ticket por defecto. |
| `STAFF_ROLE_ID` | ID del rol del staff que tendrá acceso a los tickets. |
| `TRANSCRIPT_CHANNEL_ID` (opcional) | Canal donde podrías enviar transcripciones manualmente si amplías el bot. |
| `COMMAND_PREFIX` (opcional) | Prefijo para comandos basados en texto si decides añadirlos. |

Puedes crear un archivo `.env` en local para pruebas (está ignorado en git):

```bash
DISCORD_TOKEN=tu_token
CLIENT_ID=tu_client_id
GUILD_ID=tu_guild_id
MODMAIL_CATEGORY_ID=categoria_modmail
STAFF_ROLE_ID=rol_staff
```

## Instalación local

```bash
npm install
```

### Registrar los comandos *slash*

Cada vez que modifiques los comandos, ejecútalos nuevamente:

```bash
CLIENT_ID=tu_client_id npm run register
```

El script usa `CLIENT_ID` y `GUILD_ID` para registrar comandos de forma inmediata en tu servidor.

### Ejecutar el bot

```bash
npm run start
```

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `/ticket-close [motivo]` | Cierra el ticket actual, elimina el canal y avisa al usuario. |
| `/ticket-transfer-category <categoría>` | Traslada el canal del ticket a otra categoría. |
| `/ticket-assign <miembro>` | Marca el ticket como asignado a un miembro del staff y lo anuncia en el canal. |

Estos comandos solo funcionan dentro de los canales de ticket y requieren permisos para administrar canales.

## Flujo de trabajo de un ticket

1. Un usuario envía un DM al bot.
2. Se crea automáticamente un canal en la categoría definida y se notifica al rol del staff.
3. Los mensajes (incluyendo adjuntos) se sincronizan entre el DM del usuario y el canal del ticket.
4. El staff puede asignar el ticket o moverlo a otra categoría mediante los comandos.
5. Al finalizar, se usa `/ticket-close` para cerrar el ticket. El usuario recibe un mensaje de despedida y el canal se elimina.

## Despliegue en Railway

1. Crea un nuevo proyecto en [Railway](https://railway.app/).
2. Añade este repositorio como servicio (GitHub o despliegue manual).
3. En la pestaña **Variables**, agrega los secretos descritos anteriormente (`DISCORD_TOKEN`, `CLIENT_ID`, etc.).
4. Railway instalará las dependencias y ejecutará `npm run start` automáticamente. Si necesitas registrar comandos desde Railway, puedes crear un **Deployment** temporal ejecutando `npm run register` (por ejemplo con un servicio tipo *One-off job*).

### Lista de comprobación antes del despliegue

- ✅ Verifica que todas las variables de entorno estén definidas en la sección **Variables** del servicio (puedes copiar y pegar la tabla anterior).
- ✅ Asegúrate de haber registrado los comandos *slash* al menos una vez ejecutando `npm run register` con `CLIENT_ID` y `GUILD_ID` configurados.
- ✅ Comprueba que el bot ya está invitado a tu servidor de Discord con los permisos necesarios.
- ✅ Confirma que la categoría indicada en `MODMAIL_CATEGORY_ID` existe en tu servidor y que el bot tiene permisos de gestión sobre ella.

> ✅ El token nunca se almacena en el repositorio ni en archivos versionados; debes configurarlo siempre como una variable de entorno o secreto.

## Despliegue en Render

Render también permite desplegar aplicaciones de Node.js usando variables de entorno seguras:

1. Crea un nuevo servicio **Web Service** en [Render](https://render.com/) y conecta este repositorio.
2. En la sección **Build & Deploy**, define `npm install` como **Build Command** y `npm run start` como **Start Command** (Render los toma automáticamente de `render.yaml` si lo incluyes).
3. En **Environment**, cambia a tipo **Node** y añade las variables de entorno listadas en la tabla (`DISCORD_TOKEN`, `CLIENT_ID`, etc.). No definas sus valores en el repositorio, solo en el panel de Render.
4. Despliega el servicio; Render instalará las dependencias y lanzará el bot con Node.js 18+. Si necesitas registrar comandos desde Render, crea un **Job** manual ejecutando `npm run register` o usa la consola del servicio con las variables configuradas.

### Lista de comprobación para Render

- ✅ Verifica que todas las variables (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `MODMAIL_CATEGORY_ID`, `STAFF_ROLE_ID`) estén definidas en **Environment**.
- ✅ Comprueba que has registrado los comandos *slash* al menos una vez (puede ser desde tu máquina local o desde un job en Render).
- ✅ Confirma que el bot ya está invitado a tu servidor y tiene permisos de gestionar canales.
- ✅ Revisa que la categoría por defecto existe y el bot puede mover canales a cualquier categoría de destino que utilices.

> 🛡️ Render mantiene los secretos fuera del repositorio y puedes rotarlos cuando sea necesario sin volver a desplegar el código.

## Desarrollo adicional

- Enviar transcripciones a `TRANSCRIPT_CHANNEL_ID` antes de cerrar tickets.
- Integración con bases de datos externas o paneles de administración.
- Automatizar mensajes de bienvenida dependiendo del tipo de ticket.

¡Listo! Con esto tienes una base sólida para operar un sistema de modmail moderno en Discord y desplegarlo en Railway o Render sin exponer credenciales.
