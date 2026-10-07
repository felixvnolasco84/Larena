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

`RESEND_API_KEY` y `KYC_EMAIL_FROM` del KYC se usan en **Convex**, donde ya están configurados. No deben llevar el prefijo `NEXT_PUBLIC_`. El remitente es `rodrigo@ogc.mx`. Los correos autorizados para acceder al panel son `felixvnolasco@gmail.com` y `rodrigo@ogc.mx`, tanto en desarrollo como en producción. Las notificaciones internas de prueba se envían a `felixvnolasco@gmail.com`.

## Publicación y comprobación

1. Sube los cambios de este workspace al repositorio conectado al proyecto existente de Larena en Vercel. Los cambios de esta conversación aún no tienen commit ni push.
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
