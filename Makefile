.PHONY: install dev build start lint migrate

install:
	cd web && npm install

dev:
	cd web && npm run dev

build:
	cd web && npm run build

start:
	cd web && npm start

lint:
	cd web && npm run lint

migrate:
	cd web && npx prisma migrate dev

generate:
	cd web && npx prisma generate