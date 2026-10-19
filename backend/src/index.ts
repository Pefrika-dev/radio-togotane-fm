import { createApp } from "./app";
import { config } from "./config";
import { prisma } from "./config/prisma";
import { seedDatabase } from "./seed";

async function main() {
  const app = createApp() as any;

  // Mount routes
  const routesModule = await import("./routes");
  routesModule.mountRoutes(app);

  // 404 and error handlers (must be after routes)
  const { notFoundHandler, errorHandler } = await import("./middleware/errorHandler");
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server
  app.listen(config.port, () => {
    console.log(`\n📻 Radio Togotane FM API`);
    console.log(`   Server running on http://localhost:${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Frontend URL: ${config.frontendUrl}\n`);
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
