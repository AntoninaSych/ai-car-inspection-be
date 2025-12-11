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

В отдельном терминале:

```stripe login```
```stripe listen --forward-to http://ai-car.localhost:5001/api/stripe/webhook```


Stripe CLI выведет whsec_... — вставь его в .env как STRIPE_WEBHOOK_SECRET.

Запускаешь оплату через фронт /stripe-test, платишь тестовой картой 4242 4242 4242 4242.

После успешной оплаты Stripe отправит webhook → backend обновит запись tasks.is_paid = true.