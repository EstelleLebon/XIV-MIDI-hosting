FROM postgres:17

# Modifier le gid et le uid de l'utilisateur postgres
RUN groupmod -g 1001 postgres && \
    usermod -u 1001 -g 1001 postgres

# Exposer le port PostgreSQL
EXPOSE 5432

# Démarrer le service PostgreSQL
CMD ["postgres"]