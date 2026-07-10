import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path"; 
import { fileURLToPath } from "url";
import { createusers } from "./config/initDb.js";
import { connectDB } from "./config/configDb.js";
import { routerApi } from "./routes/index.routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "./config/.env") });

const app = express();
app.use(express.json());
app.use(morgan("dev"));
// Configuración de CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: true,
  credentials: true
}));

// Servir imágenes estáticas
  app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Ruta principal de bienvenida
app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

// Inicializa la conexión a la base de datos
connectDB()
  .then(() => createusers())
  .then(() => {
    // Carga todas las rutas de la aplicación
    routerApi(app);

    // Levanta el servidor Express
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });
 