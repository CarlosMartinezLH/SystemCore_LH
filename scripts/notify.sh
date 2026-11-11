#!/system/bin/sh
FILE="/data/local/tmp/last_notif.txt"
if [ ! -f "$FILE" ]; then
  exit 0
fi

APP=$(sed -n '1p' "$FILE")
TITLE=$(sed -n '2p' "$FILE")
SHORT=$(sed -n '3p' "$FILE")
BODY=$(sed -n '4,$p' "$FILE")

if [ -z "$APP" ]; then
  APP="LanAhora Móvil"
fi
if [ -z "$TITLE" ]; then
  TITLE="LanApp (Distribuidoras)"
fi
if [ -z "$SHORT" ]; then
  SHORT="Nueva actualización disponible en LanAhora"
fi
if [ -z "$BODY" ]; then
  BODY="$SHORT"
fi

# Eliminar notificaciones anteriores con la misma etiqueta si existieran
cmd notification cancel lanapp_alert >/dev/null 2>&1

# Despachar notificación profesional con estilo BigText (estilo WhatsApp / App corporativa)
if [ -f "/sdcard/Download/lanapp_icon.png" ]; then
  cmd notification post -I file:///sdcard/Download/lanapp_icon.png -S bigtext --big-summary "$APP" --text "$BODY" -t "$SHORT" lanapp_alert "$TITLE"
else
  cmd notification post -S bigtext --big-summary "$APP" --text "$BODY" -t "$SHORT" lanapp_alert "$TITLE"
fi
