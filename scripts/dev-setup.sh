#!/bin/bash

# Script de configuración para desarrollo - Semillero Digital Platform
# Este script automatiza la configuración inicial del proyecto

set -e

echo "🚀 Configurando Semillero Digital Platform para desarrollo..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Se requiere Node.js 18+. Versión actual: $(node --version)"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado."
        exit 1
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_warning "Git no está instalado. Se recomienda para control de versiones."
    fi
    
    print_success "Prerrequisitos verificados"
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias..."
    
    # Instalar dependencias del proyecto raíz
    print_status "Instalando dependencias del proyecto raíz..."
    npm install
    
    # Instalar dependencias del backend
    print_status "Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    
    # Instalar dependencias del frontend
    print_status "Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_status "Creando archivo backend/.env..."
        cp backend/.env.example backend/.env
        print_warning "Por favor, edita backend/.env con tus credenciales de Google Cloud"
    else
        print_warning "backend/.env ya existe. No se sobrescribirá."
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_status "Creando archivo frontend/.env..."
        cp frontend/.env.example frontend/.env
        print_warning "Por favor, edita frontend/.env si es necesario"
    else
        print_warning "frontend/.env ya existe. No se sobrescribirá."
    fi
    
    print_success "Archivos de configuración creados"
}

# Verificar MongoDB
check_mongodb() {
    print_status "Verificando MongoDB..."
    
    if command -v mongod &> /dev/null; then
        print_success "MongoDB está instalado localmente"
    else
        print_warning "MongoDB no está instalado localmente."
        print_warning "Puedes:"
        print_warning "1. Instalar MongoDB localmente"
        print_warning "2. Usar MongoDB Atlas (recomendado)"
        print_warning "3. Usar Docker: docker run -d -p 27017:27017 --name mongodb mongo"
    fi
}

# Crear estructura de directorios adicionales
create_directories() {
    print_status "Creando directorios adicionales..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backend/credentials
    mkdir -p docs/images
    
    print_success "Directorios creados"
}

# Mostrar información de configuración
show_setup_info() {
    echo ""
    echo "🎉 ¡Configuración completada!"
    echo ""
    echo "📋 Próximos pasos:"
    echo ""
    echo "1. Configurar Google Cloud Platform:"
    echo "   - Crear proyecto en Google Cloud Console"
    echo "   - Habilitar Google Classroom API"
    echo "   - Crear credenciales OAuth 2.0"
    echo "   - Actualizar backend/.env con las credenciales"
    echo ""
    echo "2. Configurar base de datos:"
    echo "   - MongoDB local: Iniciar servicio mongod"
    echo "   - MongoDB Atlas: Actualizar MONGODB_URI en backend/.env"
    echo ""
    echo "3. Ejecutar la aplicación:"
    echo "   npm run dev"
    echo ""
    echo "4. Acceder a la aplicación:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - Health check: http://localhost:5000/health"
    echo ""
    echo "📚 Documentación:"
    echo "   - Configuración detallada: docs/SETUP.md"
    echo "   - API: docs/API.md"
    echo ""
}

# Función principal
main() {
    echo "🌟 Semillero Digital Platform - Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    check_mongodb
    create_directories
    show_setup_info
    
    print_success "¡Setup completado exitosamente! 🎉"
}

# Ejecutar función principal
main
