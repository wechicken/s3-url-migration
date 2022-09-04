# S3 profile migration script

## 실행방법
- .env 파일 생성
```
WECHICKEN_HOST = localhost
WECHICKEN_USER = root
WECHICKEN_PORT = 3307
WECHICKEN_DATABASE = jwt
WECHICKEN_PASSWORD = password
```
- weecode.wechicken production DB 로 환경변수 수정한다
- `npm install`: 모듈 설치
- `node profile-s3-url-migrate.js`: 스크립트 실행