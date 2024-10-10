import express from "express";
import cors from "cors";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import userRoutes from "./routes/user-routes.js";
import authRoutes from "./routes/auth-routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  next();
});

if (true) {
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "User Service API",
        version: "1.0.0",
        description: "API documentation for User Service",
        contact: {
          name: "API Support",
          url: "http://localhost:" + (process.env.PORT || 3001),
          email: "support@example.com",
        },
      },
      servers: [
        {
          url: "http://localhost:" + (process.env.PORT || 3001),
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./routes/*.js"],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log(`Swagger API Docs available at http://localhost:${port}/users/swagger`);
}


// Default route for starting page based on environment
app.get("/", (req, res, next) => {
  if (process.env.ENV === "development") {
    return res.redirect("/api-docs");
  }

  res.json({
    message: "Hello World from user-service",
  });
});
// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request - Method: ${req.method}, Path: ${req.path}, Body: ${JSON.stringify(req.body)}`);
  next();
});
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});


export default app;
export { port };
