FROM postgres:15.7

ENV POSTGRES_PASSWORD oai
ENV POSTGRES_DB oai
ENV POSTGRES_USER oai

# Pass --yes to skip the "additional disk space will be used, Do you want to continue? [Y/n]" prompt
RUN apt update && apt install postgresql-15-pgvector --yes && apt install postgresql-contrib --yes && apt clean
# Run all initdb scripts when the container is ran
COPY scripts/initdb/*.sh /docker-entrypoint-initdb.d/
