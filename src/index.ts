import app from "@/app";
import { config } from "@/shared/config";
import { logger } from "@/shared/logger";

const start = async () => {
  try {
    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.fatal(error, "Failed to start server");
    process.exit(1);
  }
};

start();
