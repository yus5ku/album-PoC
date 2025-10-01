.PHONY: up down build logs install

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

install:
	cd api && npm install
	cd web && npm install