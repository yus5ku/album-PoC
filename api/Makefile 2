.PHONY: help install dev build start prisma-generate prisma-migrate prisma-deploy prisma-studio clean

help:
	@echo "Available commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make dev            - Start development server"
	@echo "  make build          - Build for production"
	@echo "  make start          - Start production server"
	@echo "  make prisma-generate - Generate Prisma client"
	@echo "  make prisma-migrate - Run database migrations"
	@echo "  make prisma-deploy  - Deploy migrations to production"
	@echo "  make prisma-studio  - Open Prisma Studio"
	@echo "  make clean          - Clean build artifacts"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

prisma-generate:
	npm run prisma:generate

prisma-migrate:
	npm run prisma:migrate

prisma-deploy:
	npm run prisma:deploy

prisma-studio:
	npm run prisma:studio

clean:
	rm -rf dist node_modules .storage