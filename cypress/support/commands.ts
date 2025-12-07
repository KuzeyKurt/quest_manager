/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Кастомная команда для входа юзера
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Кастомная команда для выхода юзера
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Кастомная команда для очистки всех куков и localStorage
       * @example cy.clearAuth()
       */
      clearAuth(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      // Кука сессии должна быть установлена автоматически
      cy.visit('/dashboard')
    }
  })
})

Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/logout',
    failOnStatusCode: false,
  })
  cy.clearCookies()
  cy.clearLocalStorage()
})

Cypress.Commands.add('clearAuth', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.clearAllSessionStorage()
})

export {}

