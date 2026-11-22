# FPM: PHP-FPM container
FROM php:8.5-fpm-alpine AS fpm

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ARG PHP_EXTS="bcmath ctype intl fileinfo mbstring pdo pdo_mysql pdo_pgsql pgsql gd pcntl zip"
ARG PHP_PECL_EXTS="redis"

WORKDIR /opt/apps/pantaura

RUN apk add --no-cache --virtual .build-deps ${PHPIZE_DEPS} \
        freetype-dev libjpeg-turbo-dev libpng-dev libzip-dev curl-dev oniguruma-dev libxml2-dev postgresql-dev icu-dev \
    && apk add --no-cache freetype libjpeg-turbo libpng libzip curl postgresql-libs icu-libs \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) ${PHP_EXTS} \
    && pecl install ${PHP_PECL_EXTS} \
    && docker-php-ext-enable ${PHP_PECL_EXTS} \
    && apk del .build-deps

RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini \
 && sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 100M/' /usr/local/etc/php/php.ini \
 && sed -i 's/post_max_size = 8M/post_max_size = 100M/' /usr/local/etc/php/php.ini

RUN chown -R www-data:www-data /opt/apps/pantaura

USER www-data
EXPOSE 9000
CMD ["php-fpm"]

# Wayfinder: Generate TypeScript route & action types using PHP
FROM fpm AS wayfinder

USER root
WORKDIR /opt/apps/pantaura
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction
COPY . .
RUN rm -f bootstrap/cache/*.php \
    && composer dump-autoload --no-dev --optimize \
    && APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    php artisan wayfinder:generate --with-form

# Frontend: Node.js container to build frontend assets
FROM node:22-alpine AS frontend

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=wayfinder /opt/apps/pantaura/resources/js/actions ./resources/js/actions
COPY --from=wayfinder /opt/apps/pantaura/resources/js/routes ./resources/js/routes
COPY --from=wayfinder /opt/apps/pantaura/resources/js/wayfinder ./resources/js/wayfinder
RUN WAYFINDER_SKIP=true npm run build

# Web: Nginx container to serve the application
FROM nginx:1.26-alpine AS web

WORKDIR /opt/apps/pantaura

COPY ops/production/nginx/nginx.conf.template \
     /etc/nginx/templates/default.conf.template

# hanya hasil build frontend
COPY --from=frontend /app/public /opt/apps/pantaura/public

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
