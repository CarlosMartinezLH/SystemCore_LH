#!/usr/bin/env bash
# ==============================================================================
# LanAhora - Script de Instalación y Configuración Automática para Linux Mint / Ubuntu
# ==============================================================================
# Uso:
#   chmod +x setup_linux.sh
#   ./setup_linux.sh
# ==============================================================================

set -e

echo "======================================================================"
echo "    🚀  INSTALADOR AUTOMATIZADO LANAHORA - LINUX MINT / UBUNTU        "
echo "======================================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Actualizar repositorios e instalar paquetes base del sistema
echo "📦 1/6 Actualizando repositorios y paquetes esenciales de Linux..."
sudo apt update -y
sudo apt install -y git curl wget unzip xz-utils zip libglu1-mesa build-essential \
                    openjdk-17-jdk adb clang cmake ninja-build pkg-config \
                    libgtk-3-dev liblzma-dev

# 2. Configurar JAVA_HOME con JDK 17
echo "☕ 2/6 Configurando Java OpenJDK 17..."
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$PATH"

if ! grep -q "JAVA_HOME.*java-17" "$HOME/.bashrc" 2>/dev/null; then
    echo "" >> "$HOME/.bashrc"
    echo "# LanAhora Java JDK 17" >> "$HOME/.bashrc"
    echo 'export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"' >> "$HOME/.bashrc"
    echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> "$HOME/.bashrc"
fi

# 3. Instalar Node.js 20 LTS si no existe
echo "🟢 3/6 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js 20 LTS vía NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js ya está instalado: $(node -v)"
fi

# 4. Instalar Flutter SDK si no existe
echo "💙 4/6 Verificando Flutter SDK..."
FLUTTER_DIR="$HOME/development/flutter"
if ! command -v flutter &> /dev/null; then
    if [ ! -d "$FLUTTER_DIR" ]; then
        echo "Descargando Flutter SDK desde repositorio oficial en $FLUTTER_DIR..."
        mkdir -p "$HOME/development"
        git clone https://github.com/flutter/flutter.git -b stable "$FLUTTER_DIR"
    fi
    export PATH="$FLUTTER_DIR/bin:$PATH"
    if ! grep -q "flutter/bin" "$HOME/.bashrc" 2>/dev/null; then
        echo "" >> "$HOME/.bashrc"
        echo "# LanAhora Flutter SDK" >> "$HOME/.bashrc"
        echo 'export PATH="$HOME/development/flutter/bin:$PATH"' >> "$HOME/.bashrc"
    fi
else
    echo "Flutter ya está en PATH: $(flutter --version | head -n 1)"
fi

# Asegurar permisos de ejecución de adb sin sudo para tu usuario
sudo usermod -aG plugdev "$USER" || true

# 5. Generar archivo .env.local oficial de LanAhora con todas tus llaves
echo "🔐 5/6 Restaurando archivo de configuración .env.local..."
cat << 'EOF' > "$SCRIPT_DIR/.env.local"
# Puerto de ejecución local (Next.js)
PORT=3000

# Secreto Criptográfico Institucional para Firma de Sesiones JWT (HMAC-SHA256)
JWT_SECRET=lanahora_systemcore_production_hmac_secret_key_2026_saltillo

# Perímetro y Sinergia Cloudflare Zero Trust (false en local para desarrollo)
ENFORCE_CLOUDFLARE_ZERO_TRUST=false
CLOUDFLARE_ZERO_TRUST_TEAM=lanahora

# Credenciales de Servicio Nubarium (Validación Oficial CURP / RENAPO / Biometría)
NUBARIUM_USERNAME=lanahora
NUBARIUM_PASSWORD=#vEJfpcF#

# Servidor de Identidad Keycloak (IAM OIDC)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=lanahora
KEYCLOAK_CLIENT_ID=systemcore-web
KEYCLOAK_CLIENT_SECRET=systemcore_keycloak_secret_2026

# Web Push VAPID Keys para Notificaciones Reales en Celulares
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFDy2CwbSkeP1gE-Klz7QDteiOpVKM7JzXMuxpXbxiux_RcM3wqS9mTeKxy4tDsccW95-aa0l1CRu9FnJ59ynog
VAPID_PRIVATE_KEY=6U5Zi8NK43BJ8cMQGoJLE0pYJ_V1ZS3nMNK2qfnMZ9E
VAPID_SUBJECT=mailto:soporte@lanahora.com.mx

# Configuración de Envío Real de Correo (SMTP / Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=carlos_martinez@lanahora.com
SMTP_PASS=gdlljgffdeictzie
SMTP_FROM="LanAhora Seguridad" <carlos_martinez@lanahora.com>
EOF
echo "✅ .env.local creado exitosamente."

# 6. Instalar dependencias del proyecto Web y Flutter
echo "⚡ 6/6 Instalando dependencias de Node.js (SystemCore_LH)..."
npm install

if [ -d "$SCRIPT_DIR/apps/lanapp_distribuidora" ]; then
    echo "📱 Descargando dependencias de Flutter (LanApp Distribuidora)..."
    cd "$SCRIPT_DIR/apps/lanapp_distribuidora"
    "$FLUTTER_DIR/bin/flutter" pub get || flutter pub get || true
    cd "$SCRIPT_DIR"
fi

# Crear script ejecutable de arranque rápido
cat << 'EOF' > "$SCRIPT_DIR/iniciar_sistema.sh"
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$HOME/development/flutter/bin:$JAVA_HOME/bin:$PATH"

echo "======================================================================"
echo "    🚀  INICIANDO SISTEMA CORE LANAHORA (NEXT.JS EN PUERTO 3000)     "
echo "======================================================================"
echo "Abre tu navegador en: http://localhost:3000"
echo ""
npm run dev
EOF
chmod +x "$SCRIPT_DIR/iniciar_sistema.sh"

# Crear acceso directo en el Escritorio de Linux Mint si existe ~/Desktop
if [ -d "$HOME/Desktop" ] || [ -d "$HOME/Escritorio" ]; then
    DESKTOP_DIR="$HOME/Desktop"
    [ -d "$HOME/Escritorio" ] && DESKTOP_DIR="$HOME/Escritorio"
    cat << EOF > "$DESKTOP_DIR/LanAhora_SystemCore.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=LanAhora SystemCore
Comment=Iniciar Sistema Core LanAhora
Exec=bash -c "cd '$SCRIPT_DIR' && ./iniciar_sistema.sh; exec bash"
Icon=utilities-terminal
Terminal=true
Categories=Development;
EOF
    chmod +x "$DESKTOP_DIR/LanAhora_SystemCore.desktop" || true
fi

echo ""
echo "======================================================================"
echo "    🎉  ¡INSTALACIÓN COMPLETADA CON ÉXITO EN LINUX MINT!              "
echo "======================================================================"
echo ""
echo "Para arrancar el sistema en cualquier momento, ejecuta:"
echo "   ./iniciar_sistema.sh"
echo ""
echo "O simplemente ejecuta:"
echo "   npm run dev"
echo ""
echo "Tu entorno está 100% listo para trabajar."
