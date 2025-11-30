/// <reference types="cypress" />

describe('Авторизация (Login)', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  describe('AUTH-001: Открытие страницы логина неавторизованным пользователем', () => {
    it('должна отображаться страница входа со всеми элементами', () => {
      cy.visit('/login')
      
      // Проверка заголовка
      cy.contains('Добро пожаловать').should('be.visible')
      
      // Проверка описания
      cy.contains('Введите данные вашего аккаунта, чтобы войти в систему').should('be.visible')
      
      // Проверка полей формы
      cy.get('label').contains('Электронная почта').should('be.visible')
      cy.get('input[type="email"]#email').should('be.visible')
      cy.get('label').contains('Пароль').should('be.visible')
      cy.get('input[type="password"]#password').should('be.visible')
      
      // Проверка кнопки входа
      cy.get('button[type="submit"]').contains('Войти').should('be.visible')
      
      // Проверка ссылки на регистрацию
      cy.contains('Зарегистрироваться').should('be.visible')
    })
  })

  describe('AUTH-002: Переход на регистрацию со страницы логина', () => {
    it('должен происходить переход на страницу регистрации', () => {
      cy.visit('/login')
      cy.contains('Зарегистрироваться').click()
      
      cy.url().should('include', '/register')
      cy.contains('Добавить учетную запись').should('be.visible')
    })
  })

  describe('AUTH-003: Обязательность полей логина', () => {
    it('не должна отправляться форма с пустыми полями', () => {
      cy.visit('/login')
      
      // Попытка отправить форму без заполнения полей
      cy.get('button[type="submit"]').click()
      
      // HTML5 валидация должна предотвратить отправку
      cy.get('input[type="email"]#email').should('have.attr', 'required')
      cy.get('input[type="password"]#password').should('have.attr', 'required')
      
      // Форма не должна быть отправлена (URL не должен измениться)
      cy.url().should('include', '/login')
    })
  })

  describe('AUTH-004: Валидация формата email при логине', () => {
    it('не должна отправляться форма с некорректным email', () => {
      cy.visit('/login')
      
      cy.get('input[type="email"]#email').type('test')
      cy.get('input[type="password"]#password').type('password123')
      
      // HTML5 валидация должна проверить формат email
      cy.get('input[type="email"]#email').should('have.attr', 'type', 'email')
      
      // Попытка отправить форму
      cy.get('button[type="submit"]').click()
      
      // Браузер должен показать сообщение о неверном формате или не отправить форму
      cy.url().should('include', '/login')
    })
  })

  describe('AUTH-005: Отображение загрузки при отправке формы логина', () => {
    it('кнопка должна показывать состояние загрузки', () => {
      cy.visit('/login')
      
      cy.get('input[type="email"]#email').type('test@example.com')
      cy.get('input[type="password"]#password').type('wrongpassword')
      
      cy.get('button[type="submit"]').click()
      
      // Проверка изменения текста кнопки
      cy.get('button[type="submit"]').contains('Вход...').should('be.visible')
      
      // Проверка, что кнопка неактивна
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  describe('AUTH-006: Успешный вход пользователя', () => {
    it('должен происходить переход на dashboard после успешного входа', () => {
      // Сначала создаем пользователя через регистрацию
      cy.visit('/register')
      const email = `test${Date.now()}@example.com`
      const password = 'password123'
      
      cy.get('input#name').type('Test User')
      cy.get('input#email').type(email)
      cy.get('input#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Ждем редиректа на dashboard
      cy.url().should('include', '/dashboard')
      
      // Выходим
      cy.logout()
      
      // Теперь тестируем вход
      cy.visit('/login')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Проверка редиректа на dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/login')
    })
  })

  describe('AUTH-007: Ошибка при неверных данных логина', () => {
    it('должно отображаться сообщение об ошибке', () => {
      cy.visit('/login')
      
      cy.get('input[type="email"]#email').type('nonexistent@example.com')
      cy.get('input[type="password"]#password').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Ждем появления блока с ошибкой
      cy.get('[class*="destructive"]', { timeout: 5000 }).should('be.visible')
      
      // Проверяем, что текст ошибки содержит одно из возможных сообщений
      cy.get('body').should(($body) => {
        const text = $body.text()
        expect(
          text.includes('Invalid credentials') || 
          text.includes('Не вошло') ||
          text.includes('credentials')
        ).to.be.true
      })
      
      // Поля должны оставаться доступными
      cy.get('input[type="email"]#email').should('be.visible')
      cy.get('input[type="password"]#password').should('be.visible')
      
      // URL не должен измениться
      cy.url().should('include', '/login')
    })
  })

  describe('AUTH-008: Сообщение об общей ошибке при логине (сбой сети/сервера)', () => {
    it('должно отображаться сообщение об общей ошибке', () => {
      cy.visit('/login')
      
      // Перехватываем запрос и возвращаем ошибку
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('loginError')
      
      cy.get('input[type="email"]#email').type('test@example.com')
      cy.get('input[type="password"]#password').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Ждем появления сообщения об ошибке
      cy.contains('An error occurred. Please try again.', { timeout: 5000 }).should('be.visible')
      
      // Форма должна оставаться на месте
      cy.url().should('include', '/login')
    })
  })

  describe('AUTH-009: Доступ к защищённой странице без авторизации', () => {
    it('должен происходить редирект на /login', () => {
      cy.clearAuth()
      cy.visit('/dashboard')
      
      // Должен произойти редирект на страницу логина
      cy.url().should('include', '/login')
      cy.url().should('not.include', '/dashboard')
    })
  })

  describe('AUTH-010: Попытка открыть страницу логина уже авторизованным пользователем', () => {
    it('должен происходить редирект на /dashboard', () => {
      // Создаем пользователя и входим
      cy.visit('/register')
      const email = `test${Date.now()}@example.com`
      const password = 'password123'
      
      cy.get('input#name').type('Test User')
      cy.get('input#email').type(email)
      cy.get('input#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Ждем редиректа на dashboard
      cy.url().should('include', '/dashboard')
      
      // Пытаемся открыть страницу логина
      cy.visit('/login')
      
      // Должен произойти редирект на dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/login')
    })
  })

  describe('AUTH-011: Попытка открыть страницу регистрации уже авторизованным пользователем', () => {
    it('должен происходить редирект на /dashboard', () => {
      // Создаем пользователя и входим
      cy.visit('/register')
      const email = `test${Date.now()}@example.com`
      const password = 'password123'
      
      cy.get('input#name').type('Test User')
      cy.get('input#email').type(email)
      cy.get('input#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Ждем редиректа на dashboard
      cy.url().should('include', '/dashboard')
      
      // Пытаемся открыть страницу регистрации
      cy.visit('/register')
      
      // Должен произойти редирект на dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/register')
    })
  })

  describe('AUTH-012: Доступ к главной странице без авторизации', () => {
    it('главная страница должна быть доступна без редиректа', () => {
      cy.clearAuth()
      cy.visit('/')
      
      // URL должен остаться на главной странице
      cy.url().should('not.include', '/login')
      cy.url().should('match', /\/$|^http:\/\/localhost:3000$/)
    })
  })
})

