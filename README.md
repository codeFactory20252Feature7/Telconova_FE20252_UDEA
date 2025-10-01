# TelcoNova – Proyecto Sprint 1

## Introducción
TelcoNova es un sistema para la gestión de órdenes de trabajo y la asignación de técnicos en campo. Este repositorio corresponde al Sprint 1 y contiene la versión unificada del proyecto (backend, frontend y scripts de base de datos) con las funcionalidades mínimas requeridas para autenticación y asignación manual de técnicos.  

## Enlaces útiles
- Diagrama de paquetes y componentes con interfaces (draw.io): [https://drive.google.com/file/d/1hB6pI7Us7sR60EClKUjCN6IrWvGmUjr_/view?usp=drive_link] 
- Documento de reglas de negocio e historias de usuario (Azure DevOps / SharePoint): [(https://dev.azure.com/danielrincon2/TelcoNova%20-%20Sistema%20Web%20De%20Soporte)]  
- Archivo local de diagramas: `/docs/DIAGRAMAS.drawio.xml`  

## Estructura del repositorio
```
telconova_project/
  backend/                  # Spring Boot 3 (Java 17, Maven)
  frontend_supportsuite/    # React + Vite
  frontend_alt/             # Frontend alterno / legacy
  database/                 # Scripts SQL (schema.sql, data.sql, procedimientos.sql)
  docs/                     # Diagramas draw.io exportados
  README.md                 # Este archivo
  CHECKLIST.txt             # Pendientes y notas técnicas
```

## Arquitectura

### Estilo arquitectónico
El sistema fue diseñado bajo un enfoque modular con inspiración en microservicios y el patrón **pipes & filters**.  
En este sprint se consolidó un backend unificado en Spring Boot, con separación en paquetes según responsabilidades:  

- **controller**: exposición de endpoints REST.  
- **service**: lógica de negocio y reglas de aplicación.  
- **repository**: persistencia con Spring Data JPA.  
- **model**: entidades de negocio.  
- **security**: gestión de autenticación y autorización con JWT.  

### Vistas arquitectónicas
Los diagramas de paquetes y componentes elaborados en *draw.io* muestran la comunicación entre módulos.  
Los archivos fuente están en `/docs` y se recomienda exportarlos a PNG/SVG para visualización rápida.  

## Desarrollo del trabajo

### Backend
- Proyecto en Spring Boot 3 con Java 17.  
- Seguridad implementada con **Spring Security + JWT**.  
- Persistencia en MySQL mediante **Spring Data JPA**.  
- Procedimientos almacenados en MySQL para gestión de intentos de login y bloqueo automático.  
- Endpoints principales:  
  - `POST /api/auth/login` – autenticación y generación de token.  
  - `POST /api/ordenes/asignar/manual` – asignación manual de técnicos.  

### Base de datos
El diseño se realizó en tres etapas:  
1. **Entidades y reglas de negocio**: definidas a partir del análisis del módulo.  
2. **Modelo lógico (MER)**: plasmado en diagramas entidad–relación.  
3. **Modelo físico**: implementado en MySQL con tablas, claves primarias, foráneas e índices básicos.  

Scripts incluidos:  
- `schema.sql`: creación de tablas y relaciones.  
- `data.sql`: inserción de datos de prueba (usuarios, técnicos, órdenes).  
- `procedimientos.sql`: procedimientos y eventos para control de intentos de login y bloqueos.  

### Frontend
- Implementado con **React + Vite**.  
- Pantalla de inicio de sesión conectada al backend para autenticación JWT.  
- Formulario básico para la asignación manual de técnicos a órdenes de trabajo.  

## Historias de usuario implementadas en el Sprint 1

### HU_01 – Inicio de sesión del supervisor técnico
- Validación de credenciales.  
- Registro de intentos en la base de datos.  
- Bloqueo temporal de cuenta tras 3 intentos fallidos (15 minutos).  
- Generación de token JWT en login exitoso.  

### HU_03 – Asignación manual de técnico
- Endpoint REST para asignar manualmente un técnico a una orden.  
- Registro del supervisor, fecha y hora de la asignación.  
- Actualización del estado de la orden a “asignada”.  

## Requisitos de instalación
Antes de ejecutar el proyecto, es necesario contar con:  

- Java 17 o superior.  
- Maven 3.8+  
- MySQL 8.x (o MariaDB equivalente).  
- Node.js 18+ y npm.  
- (Opcional) MySQL Workbench y Postman para pruebas.  

## Ejecución del sistema

### 1. Preparar la base de datos
1. Arrancar el servicio MySQL.  
2. Crear la base de datos (si no existe):  
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS telconova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```  
3. Importar los scripts en orden:  
   ```bash
   mysql -u root -p telconova < database/schema.sql
   mysql -u root -p telconova < database/data.sql
   mysql -u root -p telconova < database/procedimientos.sql
   ```  
4. Activar el Event Scheduler para desbloqueo automático:  
   ```sql
   SET GLOBAL event_scheduler = ON;
   ```  
5. Verificar credenciales de prueba cargadas desde `data.sql`:  
   - Supervisor: `supervisor@telco.test` / `Password123!`  
   - Técnico: `tecnico@telco.test` / `TechPass123!`  

### 2. Configurar el backend
1. Editar `backend/src/main/resources/application.properties` y ajustar:  
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/telconova?useSSL=false&serverTimezone=UTC
   spring.datasource.username=USUARIO
   spring.datasource.password=CLAVE

   jwt.secret-base64=PEGAR_SECRET_BASE64_GENERADO
   jwt.expiration-ms=3600000
   ```  
2. Generar un secreto seguro para JWT (ejemplo en Python):  
   Existen varias formas de generar un secreto seguro para JWT. Se recomienda un valor aleatorio de al menos 512 bits codificado en Base64.

   1. Opción 1 – Usando Java (recomendado en este proyecto):
   Crear una clase auxiliar y ejecutarla una vez:
   
      import java.security.SecureRandom;
      import java.util.Base64;

      public class GenerateJWTSecret {
         public static void main(String[] args) {
            byte[] key = new byte[64]; // 512 bits
            new SecureRandom().nextBytes(key);
            String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(key);
            System.out.println(secret);
         }
      }

      Al ejecutar este programa, se imprimirá un secreto en consola. Copiar el valor y pegarlo en application.properties en la propiedad:

      jwt.secret-base64=EL_SECRET_GENERADO

   2. Opción 2 – Usando Python (alternativa rápida):

      python -c "import base64, os; print(base64.urlsafe_b64encode(os.urandom(64)).decode())"



### 3. Compilar y ejecutar el backend
1. Desde la carpeta `backend`:  
   ```bash
   mvn clean package -DskipTests
   mvn spring-boot:run
   ```  
2. Revisar que el API esté activo en:  
   ```
   http://localhost:8080/api
   ```

### 4. Ejecutar el frontend
1. Desde la carpeta `frontend_supportsuite`:  
   ```bash
   npm install
   npm run dev
   ```  
2. Abrir el navegador en la URL indicada por Vite (generalmente `http://localhost:5173`).  

## Ejemplos de uso del API

### Login supervisor
```bash
curl -X POST http://localhost:8080/api/auth/login   -H "Content-Type: application/json"   -d '{"correo":"supervisor@telco.test","contraseña":"Password123!"}'
```
Respuesta esperada:  
```json
{ "mensaje": "Login exitoso", "token": "<JWT>" }
```

### Acceso con token a endpoint protegido
```bash
curl -X GET http://localhost:8080/api/ordenes   -H "Authorization: Bearer <JWT>"
```

### Asignación manual de técnico
```bash
curl -X POST http://localhost:8080/api/ordenes/asignar/manual   -H "Content-Type: application/json"   -H "Authorization: Bearer <JWT>"   -d '{"idOrden": 1, "idTecnico": 2, "idSupervisor": 1, "motivo": "Asignación manual"}'
```

## Estado actual del Sprint 1
- Diagramas arquitectónicos y de base de datos elaborados en draw.io.  
- Backend unificado en Spring Boot con autenticación y asignación manual.  
- Base de datos implementada en MySQL con procedimientos.  
- Frontend inicial con login y asignación manual.  

## Próximos pasos
- Implementar notificaciones en tiempo real (HU_04).  
- Construcción de reportes de asignaciones (HU_05).  
- Normalizar relaciones JPA con asociaciones completas (`@ManyToOne`, `@OneToMany`).  
- Incorporar pruebas automatizadas.  
- Añadir `docker-compose` para facilitar despliegue.  

## Información del equipo
- Desarrollo Backend: [Cristian Diez - Roller Hernandez] – [cristian.diez@udea.edu.co-roller.hernandezl@udea.edu.co]  
- Desarrollo Frontend: [NOMBRE ---] – [CORREO ---]  
- Base de Datos: [Cristian Diez - Roller Hernandez] – [cristian.diez@udea.edu.co-roller.hernandezl@udea.edu.co]  
- Product Owner: [Grupos de analisis] – []  
