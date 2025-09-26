# Documentación de la API - Semillero Digital Platform

Esta documentación describe los endpoints disponibles en la API REST de la plataforma.

## 🔐 Autenticación

Todos los endpoints (excepto los de autenticación) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 📚 Endpoints

### Autenticación

#### `GET /api/auth/google`
Obtiene la URL de autorización de Google OAuth.

**Respuesta:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

#### `POST /api/auth/google/callback`
Procesa el callback de Google OAuth y autentica al usuario.

**Body:**
```json
{
  "code": "authorization_code_from_google"
}
```

**Respuesta:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Usuario Ejemplo",
    "role": "student",
    "picture": "https://...",
    "metadata": {
      "cohort": "2024-1",
      "specialization": "Desarrollo Web"
    }
  }
}
```

#### `GET /api/auth/me`
Obtiene información del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "Usuario Ejemplo",
  "role": "student",
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00Z",
  "metadata": {
    "cohort": "2024-1",
    "specialization": "Desarrollo Web"
  }
}
```

#### `POST /api/auth/refresh`
Refresca el token de acceso de Google.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "message": "Token actualizado correctamente",
  "expiryDate": "2024-01-15T11:30:00Z"
}
```

#### `POST /api/auth/logout`
Cierra la sesión del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

### Google Classroom

#### `GET /api/classroom/courses`
Obtiene los cursos de Google Classroom del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "courses": [
    {
      "id": "course_local_id",
      "googleClassroomId": "123456789",
      "name": "Desarrollo Web Básico",
      "section": "Cohorte 2024-1",
      "description": "Curso introductorio de desarrollo web",
      "courseState": "ACTIVE",
      "semilleroMetadata": {
        "cohort": "2024-1",
        "program": "Desarrollo Web"
      },
      "stats": {
        "totalStudents": 25,
        "totalAssignments": 12,
        "lastSyncDate": "2024-01-15T10:00:00Z"
      }
    }
  ],
  "total": 1,
  "syncDate": "2024-01-15T10:00:00Z"
}
```

#### `GET /api/classroom/courses/:courseId/students`
Obtiene estudiantes de un curso específico.

**Permisos:** Solo profesores y coordinadores

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "courseId": "123456789",
  "students": [
    {
      "googleId": "student_google_id",
      "profile": {
        "id": "student_google_id",
        "name": "Estudiante Ejemplo",
        "emailAddress": "estudiante@example.com",
        "photoUrl": "https://..."
      },
      "localData": {
        "id": "local_user_id",
        "name": "Estudiante Ejemplo",
        "email": "estudiante@example.com",
        "role": "student",
        "metadata": {
          "cohort": "2024-1"
        }
      }
    }
  ],
  "total": 25
}
```

#### `GET /api/classroom/courses/:courseId/coursework`
Obtiene tareas de un curso específico.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "courseId": "123456789",
  "coursework": [
    {
      "id": "coursework_id",
      "title": "Tarea 1: HTML Básico",
      "description": "Crear una página HTML básica",
      "state": "PUBLISHED",
      "creationTime": "2024-01-10T09:00:00Z",
      "dueDate": {
        "year": 2024,
        "month": 1,
        "day": 17
      }
    }
  ],
  "submissions": [], // Solo para estudiantes
  "total": 12
}
```

#### `GET /api/classroom/courses/:courseId/announcements`
Obtiene anuncios de un curso específico.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "courseId": "123456789",
  "announcements": [
    {
      "id": "announcement_id",
      "text": "Recordatorio: Entrega de tarea mañana",
      "state": "PUBLISHED",
      "creationTime": "2024-01-14T15:00:00Z"
    }
  ],
  "total": 5
}
```

### Estudiantes

#### `GET /api/students`
Obtiene lista de estudiantes.

**Permisos:** Solo profesores y coordinadores

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)
- `cohort`: Filtrar por cohorte
- `program`: Filtrar por programa

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "students": [
    {
      "id": "student_id",
      "email": "estudiante@example.com",
      "name": "Estudiante Ejemplo",
      "role": "student",
      "isActive": true,
      "lastLogin": "2024-01-15T08:30:00Z",
      "metadata": {
        "cohort": "2024-1",
        "specialization": "Desarrollo Web"
      }
    }
  ],
  "pagination": {
    "current": 1,
    "total": 3,
    "count": 20,
    "totalRecords": 45
  }
}
```

#### `GET /api/students/:id`
Obtiene información de un estudiante específico.

**Permisos:** 
- Estudiantes: Solo su propia información
- Profesores/Coordinadores: Cualquier estudiante

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "id": "student_id",
  "email": "estudiante@example.com",
  "name": "Estudiante Ejemplo",
  "role": "student",
  "isActive": true,
  "lastLogin": "2024-01-15T08:30:00Z",
  "metadata": {
    "cohort": "2024-1",
    "specialization": "Desarrollo Web",
    "enrollmentDate": "2024-01-01T00:00:00Z"
  }
}
```

#### `PUT /api/students/:id`
Actualiza información de un estudiante.

**Permisos:** 
- Estudiantes: Solo su propia información
- Profesores/Coordinadores: Cualquier estudiante

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "preferences": {
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "metadata": {
    "cohort": "2024-2",
    "specialization": "Desarrollo Mobile"
  }
}
```

**Respuesta:**
```json
{
  "message": "Información actualizada correctamente",
  "student": {
    "id": "student_id",
    "email": "estudiante@example.com",
    "name": "Estudiante Ejemplo",
    "role": "student",
    "metadata": {
      "cohort": "2024-2",
      "specialization": "Desarrollo Mobile"
    }
  }
}
```

### Profesores

#### `GET /api/teachers`
Obtiene lista de profesores y coordinadores.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "teachers": [
    {
      "id": "teacher_id",
      "email": "profesor@example.com",
      "name": "Profesor Ejemplo",
      "role": "teacher",
      "isActive": true,
      "lastLogin": "2024-01-15T09:00:00Z"
    }
  ],
  "total": 8
}
```

### Coordinadores

#### `GET /api/coordinators/dashboard`
Obtiene métricas del dashboard para coordinadores.

**Permisos:** Solo coordinadores y administradores

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "metrics": {
    "totalStudents": 150,
    "totalTeachers": 12,
    "totalCourses": 8,
    "activeUsersLastWeek": 89
  },
  "distribution": {
    "studentsByCohort": [
      { "_id": "2024-1", "count": 75 },
      { "_id": "2024-2", "count": 75 }
    ],
    "studentsByProgram": [
      { "_id": "Desarrollo Web", "count": 80 },
      { "_id": "Desarrollo Mobile", "count": 70 }
    ]
  },
  "recentActivity": [
    {
      "id": "user_id",
      "name": "Usuario Ejemplo",
      "email": "usuario@example.com",
      "role": "student",
      "cohort": "2024-1",
      "lastLogin": "2024-01-15T08:30:00Z"
    }
  ]
}
```

### Notificaciones

#### `GET /api/notifications`
Obtiene notificaciones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "notifications": [],
  "unreadCount": 0,
  "message": "Sistema de notificaciones - Funcionalidad en desarrollo"
}
```

#### `POST /api/notifications/mark-read`
Marca notificaciones como leídas.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "notificationIds": ["notification_id_1", "notification_id_2"]
}
```

**Respuesta:**
```json
{
  "message": "Notificaciones marcadas como leídas",
  "count": 2
}
```

## 🚨 Códigos de Error

### 400 - Bad Request
```json
{
  "error": "Datos inválidos",
  "message": "El campo 'email' es requerido"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token inválido",
  "message": "El token proporcionado no es válido"
}
```

### 403 - Forbidden
```json
{
  "error": "Permisos insuficientes",
  "message": "Se requiere rol de coordinador para acceder a este recurso"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso no encontrado",
  "message": "El usuario especificado no existe"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error interno del servidor",
  "message": "Ha ocurrido un error inesperado"
}
```

## 📝 Notas

- Todos los timestamps están en formato ISO 8601 UTC
- Los IDs son strings únicos generados por MongoDB
- Las respuestas pueden incluir campos adicionales no documentados
- Los endpoints marcados como "en desarrollo" pueden cambiar en futuras versiones
