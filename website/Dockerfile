FROM node:lts-alpine

# Définir le répertoire de travail
WORKDIR /usr/website

# Copier les fichiers de configuration npm
COPY package.json .

# Installer les dépendances
RUN npm install --production --silent --force --legacy-peer-deps

# Copier le reste des fichiers de l'application
COPY . .

# Exposer les ports 3300
EXPOSE 3300

# Construire l'application
RUN npm run build

RUN addgroup -g 1001 dev && adduser -D -u 1001 -G dev dev && chown -R dev:dev /usr/website

# Démarrer le serveur SSH et l'application
USER dev
CMD ["npm", "start"]