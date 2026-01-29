import app from "@/app";
import { mongoDBClient } from "@/infrastructure/database";
import { config } from "@/shared/config";
import { setupGracefulShutdown, setupProcessHandlers } from "@/shared/errors";
import { logger } from "@/shared/logger";

const start = async () => {
  try {
    setupProcessHandlers();

    await mongoDBClient.connect();

    const server = app.listen(config.port, () => {
      logger.info(
        {
          env: config.env,
          port: config.port,
        },
        `Server running on http://localhost:${config.port}`,
      );
    });

    setupGracefulShutdown(server);
  } catch (error) {
    logger.fatal(error, "Failed to start server");
    process.exit(1);
  }
};

start();
