velin-release-server
====================

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

Ten projekt odpowiada za zmianę aktualnej wersji aplikacji serwowanej dla klientów. Aplikacja została napisana w języku TypeScript. Jako serwer http wykorzystano bibliotekę express a jako silnik renderujący strony internetowe, bibliotekę pug. Aplikacja wykorzystuje serwer Redis do przechowania aktualnej wersji aplikacji.

Konfiguracja aplikacji jest pobierana ze zmiennych środowiskowych:
```
S3_BUCKET=bucket_name
S3_ACCESSKEY=username
S3_SECRETKEY=password

BITBUCKET_REPO=username/repo-name
BITBUCKET_USER=username
BITBUCKET_PASS=password

REDIS_HOST=redis
REDIS_PORT=6379

BASE_PATH=/release/
SESSION_SECRET=random_secret
LOGIN_USER=admin
LOGIN_PASS=password
```

Po wykonaniu zadania przez Jenkins, plik wynikowy kompilacji jest wysyłany na serwer object storage w sposób powiązany z commitem. Następnie aplikacja umożliwia wyświetlenie wszystkich commitów z przypisanym wynikiem kompilacji. Po wybraniu commitu można zatwierdzić zmianę wersji.

# Zrzuty ekranu

 ### Logowanie
![Logowanie](/media/login.png)

 ### Lista commitów
![Lista commitów](/media/index.png)


