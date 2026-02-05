.PHONY: help install dev build test lint format clean docker-build docker-run deploy deploy-staging deploy-prod

# Variables
PROJECT_ID := useful-loop-352201
SERVICE_NAME := sales-daily-report-system
REGION := asia-northeast1
IMAGE_NAME := gcr.io/$(PROJECT_ID)/$(SERVICE_NAME)

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build the application
	npm run build

test: ## Run tests
	npm test -- --run

test-watch: ## Run tests in watch mode
	npm test

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run linter
	npm run lint

lint-fix: ## Run linter and fix issues
	npm run lint:fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting
	npm run format:check

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules dist build .next

# Docker commands
docker-build: ## Build Docker image
	docker build -t $(IMAGE_NAME):latest .

docker-run: ## Run Docker container locally
	docker run -p 8080:8080 --env-file .env $(IMAGE_NAME):latest

docker-push: ## Push Docker image to GCR
	docker push $(IMAGE_NAME):latest

# Prisma commands
prisma-generate: ## Generate Prisma Client
	npm run prisma:generate

prisma-migrate: ## Run Prisma migrations (dev)
	npm run prisma:migrate

prisma-migrate-prod: ## Run Prisma migrations (production)
	npm run prisma:migrate:prod

prisma-studio: ## Open Prisma Studio
	npm run prisma:studio

prisma-seed: ## Seed the database
	npm run prisma:seed

db-reset: ## Reset the database
	npm run db:reset

# Google Cloud Deploy commands
gcloud-auth: ## Authenticate with Google Cloud
	gcloud auth login
	gcloud config set project $(PROJECT_ID)

gcloud-build: ## Build image with Cloud Build
	gcloud builds submit --tag $(IMAGE_NAME):latest

deploy-staging: gcloud-build ## Deploy to Cloud Run (staging)
	gcloud run deploy $(SERVICE_NAME)-staging \
		--image $(IMAGE_NAME):latest \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--set-env-vars NODE_ENV=staging \
		--max-instances 5 \
		--memory 512Mi \
		--cpu 1

deploy-prod: gcloud-build ## Deploy to Cloud Run (production)
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME):latest \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated \
		--set-env-vars NODE_ENV=production \
		--max-instances 10 \
		--memory 1Gi \
		--cpu 2

deploy: deploy-prod ## Deploy to production (alias)

# Quick deploy (skips build)
deploy-quick: ## Quick deploy without rebuilding
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME):latest \
		--platform managed \
		--region $(REGION)

# Cloud Run management
logs: ## Show Cloud Run logs
	gcloud run services logs read $(SERVICE_NAME) --region $(REGION) --limit 50

describe: ## Describe Cloud Run service
	gcloud run services describe $(SERVICE_NAME) --region $(REGION)

# Setup commands
setup: install prisma-generate ## Initial setup
	@echo "Setup complete! Run 'make dev' to start the development server."

ci: lint test ## Run CI checks (lint + test)
