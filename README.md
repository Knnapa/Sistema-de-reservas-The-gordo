# Sistema de Reservas - The Gordo

Aplicación web para la gestión de reservas de un restaurante, que permite a clientes realizar reservas y a administradores gestionar mesas, horarios y disponibilidad.

## Tecnologías

- React
- Supabase
- Tailwind CSS
- Vite

## Funcionalidades

### Cliente
- Crear reservas
- Seleccionar fecha y hora
- Ingresar datos personales

### Administrador
- Login seguro
- Gestión de mesas
- Gestión de horarios
- Ver y cancelar reservas

## Instalación

1. Clonar el repositorio:
   git clone https://github.com/Knnapa/Sistema-de-reservas-The-gordo.git

2. Entrar al proyecto:
   cd Sistema-de-reservas-The-gordo

3. Instalar dependencias:
   npm install

4. Ejecutar:
   npm run dev

## Variables de entorno

Crear un archivo `.env` con:

VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key

## Estructura

src/
 ├── pages/
 ├── components/
 ├── services/
 ├── hooks/

## Estado

Proyecto en desarrollo 🚧

## Autor

- Tu nombre
- GitHub: https://github.com/Knnapa

## Capturas

![Dashboard](./screenshots/dashboard.png)

## Seguridad

- Autenticación con Supabase
- Control de acceso con RLS
