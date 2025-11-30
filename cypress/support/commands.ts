/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout a user
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to clear all cookies and localStorage
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
      // Session cookie should be set automatically
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

