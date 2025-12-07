# Cypress E2E Тесты

## Настройка

### 1. Переменные окружения

Cypress автоматически использует локальный URL `http://localhost:3000` и локальную БД `prisma/dev.db`.

Если нужно изменить настройки, создайте файл `cypress.env.json`:

```json
{
  "BASE_URL": "http://localhost:3000",
  "DATABASE_URL": "file:./prisma/dev.db"
}
```

Или используйте переменные окружения:

```bash
export CYPRESS_BASE_URL=http://localhost:3000
export DATABASE_URL=file:./prisma/dev.db
```

### 2. Запуск приложения

Перед запуском тестов убедитесь, что приложение запущено:

```bash
pnpm dev
```

Приложение должно быть доступно на `http://localhost:3000`

### 3. База данных

Cypress автоматически подключается к локальной SQLite БД (`prisma/dev.db`).

**Важно:** Убедитесь, что:
- БД существует и миграции применены: `npx prisma migrate dev`
- Prisma Client сгенерирован: `npx prisma generate`

## Запуск тестов

### Интерактивный режим (рекомендуется для разработки)

```bash
pnpm cypress:open
```

### Headless режим (для CI/CD)

```bash
pnpm cypress:run
# или
pnpm test:e2e
```

## Работа с БД в тестах

Cypress предоставляет tasks для работы с БД:

### Очистка БД

```typescript
cy.task('db:reset')
```

### Создание пользователя

```typescript
cy.task('db:createUser', {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
})
```

### Удаление пользователя

```typescript
cy.task('db:deleteUser', 'test@example.com')
```

### Получение пользователя

```typescript
cy.task('db:getUser', 'test@example.com').then((user) => {
  // user: { id, email, name, createdAt }
})
```

### Проверка существования пользователя

```typescript
cy.task('db:userExists', 'test@example.com').then((exists) => {
  // exists: boolean
})
```

## Пример использования

```typescript
describe('Мой тест', () => {
  beforeEach(() => {
    // Очищаем БД перед каждым тестом
    cy.task('db:reset')
    
    // Создаем тестового пользователя
    cy.task('db:createUser', {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })
  })

  it('должен войти пользователь', () => {
    cy.visit('/login')
    cy.get('input#email').type('test@example.com')
    cy.get('input#password').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

## Структура тестов

- `cypress/e2e/auth.cy.ts` - тесты авторизации
- `cypress/e2e/register.cy.ts` - тесты регистрации
- `cypress/support/commands.ts` - кастомные команды
- `cypress/support/db.ts` - утилиты для работы с БД
- `cypress/support/e2e.ts` - настройки для E2E тестов

## Troubleshooting

### Ошибка подключения к БД

Убедитесь, что:
1. Файл `prisma/dev.db` существует
2. Путь к БД указан правильно в `DATABASE_URL`
3. Prisma Client сгенерирован: `npx prisma generate`

### Ошибка подключения к приложению

Убедитесь, что:
1. Приложение запущено на `http://localhost:3000`
2. URL указан правильно в `CYPRESS_BASE_URL` или `cypress.config.ts`

### Ошибки в тестах

Проверьте:
1. БД не заблокирована другим процессом
2. Все миграции применены
3. Prisma Client актуален


