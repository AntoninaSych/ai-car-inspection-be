Налаштування:
1. Download Docker Desktop ad run   https://docs.docker.com/get-started/introduction/get-docker-desktop/
3. In terminal in folder foodies_back run
   - ```docker compose up```
   - ```npm install -g nodemon```
   - ```npm run dev```
   - ```npm run db:reset```
4. Also available commads:
   - ```npx sequelize-cli db:migrate```
   - ```npx sequelize-cli db:seed:undo:all```
   - ```npx sequelize-cli db:seed:all```
5Swagger Documentation http://localhost:5001/api-docs/