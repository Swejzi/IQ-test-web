# IQ Test Web Application Makefile
# Development commands for Docker-based environment

.PHONY: help setup start stop restart clean test lint db-migrate db-seed backup logs

# Default target
help:
	@echo "IQ Test Web Application - Development Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup          - Initial project setup (install deps, setup DB)"
	@echo "  make start          - Start development environment"
	@echo "  make stop           - Stop all containers"
	@echo "  make restart        - Restart all containers"
	@echo ""
	@echo "Development Commands:"
	@echo "  make test           - Run all tests (unit, integration, e2e)"
	@echo "  make test-unit      - Run unit tests only"
	@echo "  make test-e2e       - Run E2E tests only"
	@echo "  make lint           - Run code quality checks"
	@echo "  make format         - Format code with Prettier"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed database with test data"
	@echo "  make db-reset       - Reset database (drop + migrate + seed)"
	@echo "  make db-studio      - Open Prisma Studio"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make logs           - Show logs from all containers"
	@echo "  make logs-backend   - Show backend logs only"
	@echo "  make logs-frontend  - Show frontend logs only"
	@echo "  make backup         - Backup database and files"
	@echo "  make clean          - Clean up Docker resources"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"

# Setup Commands
setup:
	@echo "🚀 Setting up IQ Test Web Application..."
	@docker-compose build
	@make db-migrate
	@make db-seed
	@echo "✅ Setup complete! Run 'make start' to begin development."

start:
	@echo "🏃 Starting development environment..."
	@docker-compose up -d
	@echo "✅ Development environment started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:3001"
	@echo "🗄️  PgAdmin: http://localhost:5050"
	@echo "📊 Redis Commander: http://localhost:8081"

stop:
	@echo "🛑 Stopping all containers..."
	@docker-compose down

restart:
	@echo "🔄 Restarting all containers..."
	@docker-compose restart

# Development Commands
test:
	@echo "🧪 Running all tests..."
	@docker-compose exec backend npm run test
	@docker-compose exec frontend npm run test -- --coverage --watchAll=false
	@make test-e2e

test-unit:
	@echo "🧪 Running unit tests..."
	@docker-compose exec backend npm run test:unit
	@docker-compose exec frontend npm run test -- --coverage --watchAll=false

test-e2e:
	@echo "🧪 Running E2E tests..."
	@docker-compose exec frontend npm run test:e2e

lint:
	@echo "🔍 Running code quality checks..."
	@docker-compose exec backend npm run lint
	@docker-compose exec frontend npm run lint
	@echo "✅ Code quality checks completed!"

format:
	@echo "💅 Formatting code..."
	@docker-compose exec backend npm run format
	@docker-compose exec frontend npm run format
	@echo "✅ Code formatting completed!"

# Database Commands
db-migrate:
	@echo "🗄️  Running database migrations..."
	@docker-compose exec backend npx prisma migrate dev

db-seed:
	@echo "🌱 Seeding database with test data..."
	@docker-compose exec backend npm run db:seed

db-reset:
	@echo "🔄 Resetting database..."
	@docker-compose exec backend npx prisma migrate reset --force
	@make db-seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	@docker-compose exec backend npx prisma studio

# Utility Commands
logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f backend

logs-frontend:
	@docker-compose logs -f frontend

backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U iq_test_user iq_test_db > backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in backups/ directory"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	@docker-compose down -v
	@docker system prune -f
	@docker volume prune -f
	@echo "✅ Cleanup completed!"

shell-backend:
	@docker-compose exec backend /bin/sh

shell-frontend:
	@docker-compose exec frontend /bin/sh

# Production Commands
build-prod:
	@echo "🏗️  Building production images..."
	@docker-compose -f docker-compose.prod.yml build

deploy-staging:
	@echo "🚀 Deploying to staging..."
	@echo "⚠️  Staging deployment not implemented yet"

deploy-prod:
	@echo "🚀 Deploying to production..."
	@echo "⚠️  Production deployment requires manual approval"
