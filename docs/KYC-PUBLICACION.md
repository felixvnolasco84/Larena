# Publicación manual de Larena KYC

El backend de producción ya está publicado y configurado en Convex. La publicación del sitio en Vercel queda a cargo de Felix, según lo solicitado el 7 de octubre de 2026.

## Variables del proyecto existente en Vercel

Importa `.env.kyc-production.local` en las variables **Production** del proyecto de Larena. El archivo está ignorado por Git; contiene la clave privada para la descarga de archivos y no debe compartirse ni subirse al repositorio. Conserva las variables existentes del sitio, incluidas las del formulario de contacto.

| Variable | Configuración |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | `https://friendly-lyrebird-354.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://friendly-lyrebird-354.convex.site` |
| `KYC_FILE_PROXY_SECRET` | Copiar del archivo privado; debe coincidir con Convex de producción. |
| `KYC_CONTROLLER_NAME` | `OGC DEVELOPMENTS` |
| `KYC_CONTROLLER_ADDRESS` | Copiar el domicilio completo del archivo privado. |
| `KYC_PRIVACY_EMAIL` | `rodrigo@ogc.mx` |

`RESEND_API_KEY` y `KYC_EMAIL_FROM` del KYC se usan en **Convex**. No deben llevar el prefijo `NEXT_PUBLIC_`. El remitente debe ser `info@larena.mx` en desarrollo y producción. Los correos autorizados para acceder al panel son `felixvnolasco@gmail.com` y `rodrigo@ogc.mx`, tanto en desarrollo como en producción. Las notificaciones internas de prueba se envían a `felixvnolasco@gmail.com`.

## Remitente y marca de los correos

Los códigos de acceso y las confirmaciones KYC en español e inglés usan la marca **LARENA**. El formulario de contacto también envía desde `info@larena.mx`.

- En cada despliegue de Convex, configura `KYC_EMAIL_FROM=info@larena.mx` y una `RESEND_API_KEY` con permiso para enviar desde `larena.mx`. El código consulta `KYC_EMAIL_FROM`, no una variable llamada `FROM`.
- En Resend, verifica el dominio exacto `larena.mx` y sus registros DNS. Verificar únicamente un subdominio no habilita el remitente `info@larena.mx`. Consulta la [documentación de dominios de Resend](https://resend.com/docs/dashboard/domains/introduction).
- El formulario de contacto usa la `RESEND_API_KEY` de **Next.js/Vercel**, por separado de Convex. Si la clave anterior se revocó, actualiza también esta variable en Vercel y en `.env` para desarrollo local. Vuelve a publicar el sitio después de cambiar las variables de Vercel.
- Publica los cambios de `convex/auth.ts` y `lib/kyc/copy.json` en Convex para que los asuntos y las firmas nuevos entren en vigor. Cambiar las variables no actualiza las plantillas del código desplegado.
- Comprueba el código de acceso, las confirmaciones KYC ES/EN, la notificación interna y el formulario de contacto. Este último manda una copia a `info@larena.mx`; el buzón o alias debe recibir correo para que esa copia y las respuestas lleguen al equipo.

El script `convex-production-setup.mjs` copia la configuración de correo de desarrollo a producción. Antes de ejecutarlo, confirma que desarrollo también tenga el remitente y la clave nuevos.

## Publicación y comprobación

1. Publica en Vercel la versión actual de `main` del repositorio de Larena. El backend con los asuntos y firmas LARENA se desplegó en Convex de producción el 7 de octubre de 2026; las variables de desarrollo y producción usan `info@larena.mx` y la clave de Resend actualizada.
2. Para esta publicación manual puedes usar el comando de build habitual `npm run build`: el backend de producción ya se desplegó. Si posteriormente quieres publicar ambos desde Vercel, configura un `CONVEX_DEPLOY_KEY` de producción y el comando `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`, como indica la [guía oficial de Convex](https://docs.convex.dev/production/hosting/vercel).
3. Publica el sitio con las variables **Production**, evitando que apunte a `good-toucan-318`, que es desarrollo.
4. Comprueba `https://www.larena.mx/kyc/aviso-privacidad`, inicia sesión en `/admin/login` con el correo autorizado y verifica que el acceso se conserva al navegar y recargar.
5. Crea una invitación claramente marcada como prueba; valida el enlace, el borrador, los documentos, la firma, el acuse y ambos correos. Verifica una descarga privada de 25 MB desde el dominio publicado, incluyendo la configuración de duración del servidor del plan de Vercel.
6. Configura los destinatarios internos definitivos mediante `KYC_NOTIFICATION_EMAILS` en Convex cuando OGC los proporcione. Hasta entonces, las notificaciones llegarán al correo de pruebas de Felix.

Los logs del proveedor deben omitir los tokens del segmento `/kyc/[token]` y los cuerpos de solicitudes KYC. El sitio aplica `noindex`, `no-referrer` y `no-store` a las rutas privadas.

## Entornos y pruebas realizadas

- Desarrollo: `good-toucan-318`, sitio local `http://localhost:3000`.
- Producción: `friendly-lyrebird-354`, `SITE_URL=https://www.larena.mx` y aviso en el mismo dominio.
- Ambas configuraciones tienen Resend, el perfil de privacidad y la lista de acceso. Producción tiene claves de firma y descarga independientes.
- Se recibieron en Gmail los códigos reales de acceso y los cuatro correos de dos expedientes ficticios de desarrollo: confirmaciones ES/EN y notificaciones internas. El doble envío conserva el folio y no duplica correos.
- Los folios de prueba `KYC-LAR-0002` y `KYC-LAR-0003` están únicamente en desarrollo. La primera recepción real de producción comenzará en `KYC-LAR-0001`.
- Para volver a preparar las variables de hosting de esta producción, ejecuta `node scripts/convex-production-setup.mjs https://friendly-lyrebird-354.convex.cloud`. El script preserva las claves de firma y descarga existentes y no imprime secretos; copia la configuración de correo y privacidad del entorno de desarrollo seleccionado.
