# Express Inventory CQRS

## Local Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable                     | Description                            | Default                                                                 |
| ---------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| `DOCKER_MONGO_ROOT_USERNAME` | MongoDB root username (docker-compose) | `root`                                                                  |
| `DOCKER_MONGO_ROOT_PASSWORD` | MongoDB root password (docker-compose) | `root`                                                                  |
| `DOCKER_MONGO_DATABASE`      | MongoDB database name (docker-compose) | `inventory_system`                                                      |
| `MONGODB_URI`                | MongoDB connection string for the app  | `mongodb://root:root@localhost:27017/inventory_system?authSource=admin` |
| `REDIS_URL`                  | Redis connection string for the app    | `redis://localhost:6379`                                                |
| `PORT`                       | App Port                               | `3000`                                                                  |

> **Note:** The `DOCKER_*` variables are only used by docker-compose to configure the containers. The `MONGODB_URI` and `REDIS_URL` are used by the application to connect to these services.

### Running Services with Docker Compose

| Script                   | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run docker`         | Start containers in detached mode  |
| `npm run docker:down`    | Stop containers                    |
| `npm run docker:logs`    | View container logs (follow mode)  |
| `npm run docker:restart` | Restart containers                 |
| `npm run docker:clean`   | Stop containers and remove volumes |

### Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

| Script                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `npm run lint`         | Check for linting issues                                  |
| `npm run lint:fix`     | Fix linting issues (safe fixes)                           |
| `npm run lint:fix:all` | Fix linting issues (including unsafe fixes)               |
| `npm run format`       | Check formatting                                          |
| `npm run format:fix`   | Fix formatting issues                                     |
| `npm run check`        | Run both linting and formatting checks                    |
| `npm run check:fix`    | Fix both linting and formatting issues (including unsafe) |
