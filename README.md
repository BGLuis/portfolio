<div align="center">

![Angular][Angular.io]
![Nestjs][Nestjs.io]
![Mysql][Mysql.io]
![Sass][Sass.io]
![Docker][Docker.io]
![Markdown][Markdown.io]

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]

  <!-- <a href="https://github.com/bgluis/portfolio/">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3>Portfólio</h3>
</div>

# 📖 Sobre

Um portfolio com tema de exploração espacial feito para uma atividade da disiplina Laboratório de Desenvolvimento de Software

# ⚙️ Configurações

Para configurar o projeto, faça uma copia do arquivo `.env.example` e renomeie para `.env` na raiz e preencha com as variáveis necessárias e confira a pasta `frontend/src/environments`

# 📋 Enunciado

O objetivo é desenvolver um website de portfólio profissional para você, que deseja
apresentar sua trajetória, habilidades, projetos e formas de contato de maneira moderna
e acessível.

# 💻 Como iniciar

## Requisitos

-   Habilitar a virtualização no BIOS do seu computador
-   Ter o Docker instalado

## Instalação do Docker

1. Acesse o site oficial: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Baixe e instale o Docker conforme seu sistema operacional (Linux, Windows ou Mac).

3. Após instalar, verifique se está tudo certo:

```bash
docker --version
docker-compose --version
```

## Executando o ambiente de desenvolvimento

1. No diretório do projeto, execute:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

2. Para parar os containers:

```bash
docker compose -f docker-compose.dev.yml down
```

## 🗂️ Estrutura de Pastas

```
portfolio/
├── README.md
├── .env.example
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── src/
│   │   ├── environments/...
│   │   ├── app/
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── main.server.ts
│   │   ├── server.ts
│   │   └── styles.scss
├── backend/
│   ├── nest-cli.json
│   ├── package.json
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
```

# 🤝 Contribuidores

 <a href = "https://github.com/bgluis/portfolio/graphs/contributors">
   <img src = "https://contrib.rocks/image?repo=bgluis/portfolio"/>
 </a>

 <!-- Links -->

[user-path]: bgluis/
[repossitory-path]: bgluis/portfolio/
[contributors-shield]: https://img.shields.io/github/contributors/bgluis/portfolio.svg?style=for-the-badge
[contributors-url]: https://github.com/bgluis/portfolio/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/bgluis/portfolio.svg?style=for-the-badge
[forks-url]: https://github.com/bgluis/portfolio/network/members
[stars-shield]: https://img.shields.io/github/stars/bgluis/portfolio.svg?style=for-the-badge
[stars-url]: https://github.com/bgluis/portfolio/stargazers
[issues-shield]: https://img.shields.io/github/issues/bgluis/portfolio.svg?style=for-the-badge
[issues-url]: https://github.com/bgluis/portfolio/issues
[license-shield]: https://img.shields.io/github/license/bgluis/portfolio.svg?style=for-the-badge
[license-url]: https://github.com/bgluis/portfolio/blob/master/LICENSE.txt
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Nestjs.io]: https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white
[Mysql.io]: https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&color=00758f&logoColor=white
[Sass.io]: https://img.shields.io/badge/Sass-000?style=for-the-badge&logo=sass&color=cc6699&logoColor=white
[Docker.io]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Markdown.io]: https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white
