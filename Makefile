#!make
include .env

IMAGE_VERSION ?= latest

export IMAGE_VERSION

ps:
	docker compose -f docker-compose.yaml -p ${DOCKER_NAME} ps;

serve:
	docker compose -f docker-compose.yaml -p ${DOCKER_NAME} up -d;

down:
	docker compose -f docker-compose.yaml -p ${DOCKER_NAME} down;

shell:
	docker compose -f docker-compose.yaml -p ${DOCKER_NAME} exec -it web sh;

docker-build-web:
	docker build --build-arg IMAGE_VERSION=${IMAGE_VERSION} -f Dockerfile -t pantaura/web:${IMAGE_VERSION} .

migrate-fresh:
	php artisan migrate:fresh --force && php artisan optimize:clear && php artisan db:seed --force
