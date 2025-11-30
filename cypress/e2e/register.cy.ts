/// <reference types="cypress" />

describe('Регистрация (Register)', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  describe('REG-001: Открытие страницы регистрации неавторизованным пользователем', () => {
    it('должна отображаться страница регистрации со всеми элементами', () => {
      cy.visit('/register')
      
      // Проверка заголовка
      cy.contains('Добавить учетную запись').should('be.visible')
      
      // Проверка описания
      cy.contains('Заполните инфрмацию, чтобы добавить учетную запись').should('be.visible')
      
      // Проверка полей формы
      cy.get('label').contains('Имя').should('be.visible')
      cy.get('input#name').should('be.visible')
      cy.get('label').contains('Электронная почта').should('be.visible')
      cy.get('input[type="email"]#email').should('be.visible')
      cy.get('label').contains('Пароль').should('be.visible')
      cy.get('input[type="password"]#password').should('be.visible')
      
      // Проверка кнопки регистрации
      cy.get('button[type="submit"]').contains('Добавить учетную запись').should('be.visible')
      
      // Проверка ссылки на вход
      cy.contains('Войти').should('be.visible')
    })
  })

  describe('REG-002: Переход на логин со страницы регистрации', () => {
    it('должен происходить переход на страницу логина', () => {
      cy.visit('/register')
      cy.contains('Войти').click()
      
      cy.url().should('include', '/login')
      cy.contains('Добро пожаловать').should('be.visible')
    })
  })

  describe('REG-003: Обязательность полей регистрации', () => {
    it('не должна отправляться форма с пустыми полями', () => {
      cy.visit('/register')
      
      // Попытка отправить форму без заполнения полей
      cy.get('button[type="submit"]').click()
      
      // HTML5 валидация должна предотвратить отправку
      cy.get('input#name').should('have.attr', 'required')
      cy.get('input[type="email"]#email').should('have.attr', 'required')
      cy.get('input[type="password"]#password').should('have.attr', 'required')
      
      // Форма не должна быть отправлена
      cy.url().should('include', '/register')
    })
  })

  describe('REG-004: Валидация формата email при регистрации', () => {
    it('не должна отправляться форма с некорректным email', () => {
      cy.visit('/register')
      
      cy.get('input#name').type('Test User')
      cy.get('input[type="email"]#email').type('user')
      cy.get('input[type="password"]#password').type('password123')
      
      // HTML5 валидация должна проверить формат email
      cy.get('input[type="email"]#email').should('have.attr', 'type', 'email')
      
      // Попытка отправить форму
      cy.get('button[type="submit"]').click()
      
      // Браузер должен показать сообщение о неверном формате или не отправить форму
      cy.url().should('include', '/register')
    })
  })

  describe('REG-005: Минимальная длина пароля при регистрации', () => {
    it('не должна отправляться форма с паролем короче 6 символов', () => {
      cy.visit('/register')
      
      cy.get('input#name').type('Test User')
      cy.get('input[type="email"]#email').type('test@example.com')
      cy.get('input[type="password"]#password').type('12345') // 5 символов
      
      // Проверка атрибута minLength
      cy.get('input[type="password"]#password').should('have.attr', 'minLength', '6')
      
      // Попытка отправить форму
      cy.get('button[type="submit"]').click()
      
      // Форма не должна быть отправлена
      cy.url().should('include', '/register')
    })
  })

  describe('REG-006: Отображение загрузки при отправке формы регистрации', () => {
    it('кнопка должна показывать состояние загрузки', () => {
      cy.visit('/register')
      
      const email = `test${Date.now()}@example.com`
      
      cy.get('input#name').type('Test User')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type('password123')
      
      cy.get('button[type="submit"]').click()
      
      // Проверка изменения текста кнопки
      cy.get('button[type="submit"]').contains('Добавление учетной записи...').should('be.visible')
      
      // Проверка, что кнопка неактивна
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  describe('REG-007: Успешная регистрация нового пользователя', () => {
    it('должен происходить переход на dashboard после успешной регистрации', () => {
      cy.visit('/register')
      
      const email = `test${Date.now()}@example.com`
      const password = 'password123'
      
      cy.get('input#name').type('Test User')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Проверка редиректа на dashboard
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/register')
    })
  })

  describe('REG-008: Отображение ошибки при неудачной регистрации (email уже занят)', () => {
    it('должно отображаться сообщение об ошибке', () => {
      // Сначала создаем пользователя
      cy.visit('/register')
      const email = `test${Date.now()}@example.com`
      const password = 'password123'
      
      cy.get('input#name').type('First User')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Ждем редиректа на dashboard
      cy.url().should('include', '/dashboard')
      
      // Выходим
      cy.logout()
      
      // Пытаемся зарегистрировать пользователя с тем же email
      cy.visit('/register')
      cy.get('input#name').type('Second User')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type(password)
      cy.get('button[type="submit"]').click()
      
      // Ждем появления блока с ошибкой
      cy.get('[class*="destructive"]', { timeout: 5000 }).should('be.visible')
      
      // Проверяем, что текст ошибки содержит одно из возможных сообщений
      cy.get('body').should(($body) => {
        const text = $body.text()
        expect(
          text.includes('User already exists') || 
          text.includes('Registration failed') ||
          text.includes('already exists')
        ).to.be.true
      })
      
      // Форма должна оставаться доступной
      cy.get('input#name').should('be.visible')
      cy.get('input[type="email"]#email').should('be.visible')
      cy.get('input[type="password"]#password').should('be.visible')
      
      // URL не должен измениться
      cy.url().should('include', '/register')
    })
  })

  describe('REG-009: Сообщение об общей ошибке при регистрации (сбой сети/сервера)', () => {
    it('должно отображаться сообщение об общей ошибке', () => {
      cy.visit('/register')
      
      // Перехватываем запрос и возвращаем ошибку
      cy.intercept('POST', '/api/auth/register', { forceNetworkError: true }).as('registerError')
      
      const email = `test${Date.now()}@example.com`
      
      cy.get('input#name').type('Test User')
      cy.get('input[type="email"]#email').type(email)
      cy.get('input[type="password"]#password').type('password123')
      cy.get('button[type="submit"]').click()
      
      // Ждем появления сообщения об ошибке
      cy.contains('An error occurred. Please try again.', { timeout: 5000 }).should('be.visible')
      
      // Форма должна оставаться на месте
      cy.url().should('include', '/register')
    })
  })
})

