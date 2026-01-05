import app from "@/app";
import { config } from "@/shared/config";
import { logger } from "@/shared/logger";
import { setupGracefulShutdown, setupProcessHandlers } from "@/shared/errors";

const start = async () => {
  try {
    setupProcessHandlers();

    const server = app.listen(config.port, () => {
      logger.info(
        {
          env: config.env,
          port: config.port,
        },
        `Server running on http://localhost:${config.port}`
      );
    });

    setupGracefulShutdown(server);
  } catch (error) {
    logger.fatal(error, "Failed to start server");
    process.exit(1);
  }
};

start();
