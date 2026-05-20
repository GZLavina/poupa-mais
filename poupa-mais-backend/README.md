# Poupa Mais Backend

Aplicação backend base do projeto **Poupa Mais**, construída com:
- Java
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Flyway
- H2 Database
- OpenAPI (Swagger UI)

## Pré-requisitos
- Java 26
- Maven (opcional, pois o projeto já inclui Maven Wrapper)

## Como rodar
No diretório `poupa-mais-backend`, execute:

```bash
./mvnw spring-boot:run
```

Em Windows:

```bash
mvnw.cmd spring-boot:run
```

O backend ficará disponível em `http://localhost:8080`.

## Como interagir com a aplicação
Com a aplicação em execução, você pode validar os recursos base pelos links:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Console H2: `http://localhost:8080/h2-console`

Configuração atual do H2:
- JDBC URL: `jdbc:h2:mem:poupamaisdb`
- User: `sa`
- Password: (vazio)

Observação: no estado atual, o projeto é uma base inicial e ainda não possui endpoints de negócio implementados.

## Scripts/comandos úteis
- `./mvnw spring-boot:run`: inicia o backend em desenvolvimento
- `./mvnw test`: executa os testes
- `./mvnw clean package`: gera artefato da aplicação
