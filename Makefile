#!make
include .env

IMAGE_VERSION ?= latest

export IMAGE_VERSION

ps:
	@if [ "$(APP_ENV)" = "local" ]; then \
		docker compose -f docker-compose.local.yaml -p ${DOCKER_NAME} ps; \
	else \
		docker compose -f docker-compose.production.yaml -p ${DOCKER_NAME} ps; \
	fi

serve:
	@if [ "$(APP_ENV)" = "local" ]; then \
		docker compose -f docker-compose.local.yaml -p ${DOCKER_NAME} up -d; \
	else \
		docker compose -f docker-compose.production.yaml -p ${DOCKER_NAME} up -d; \
	fi

down:
	@if [ "$(APP_ENV)" = "local" ]; then \
		docker compose -f docker-compose.local.yaml -p ${DOCKER_NAME} down; \
	else \
		docker compose -f docker-compose.production.yaml -p ${DOCKER_NAME} down; \
	fi

shell:
	@if [ "$(APP_ENV)" = "local" ]; then \
		docker compose -f docker-compose.local.yaml -p ${DOCKER_NAME} exec -it web sh; \
	else \
		docker compose -f docker-compose.production.yaml -p ${DOCKER_NAME} exec -it fpm sh; \
	fi

docker-build-web:
	docker build --build-arg IMAGE_VERSION=${IMAGE_VERSION} -f ops/${APP_ENV}/Dockerfile -t pantaura/web:${IMAGE_VERSION} .

