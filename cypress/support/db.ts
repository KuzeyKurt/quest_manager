/// <reference types="cypress" />

/**
 * Утилиты для работы с базой данных в Cypress тестах
 */

/**
 * Очищает всю базу данных
 * @example cy.task('db:reset')
 */
export const resetDatabase = () => {
  return cy.task('db:reset')
}

/**
 * Создает пользователя в базе данных
 * @example cy.task('db:createUser', { email: 'test@example.com', password: 'password123', name: 'Test User' })
 */
export const createUser = (data: { email: string; password: string; name: string }) => {
  return cy.task('db:createUser', data)
}

/**
 * Удаляет пользователя по email
 * @example cy.task('db:deleteUser', 'test@example.com')
 */
export const deleteUser = (email: string) => {
  return cy.task('db:deleteUser', email)
}

/**
 * Получает пользователя по email
 * @example cy.task('db:getUser', 'test@example.com')
 */
export const getUser = (email: string) => {
  return cy.task('db:getUser', email)
}

/**
 * Проверяет существование пользователя
 * @example cy.task('db:userExists', 'test@example.com')
 */
export const userExists = (email: string) => {
  return cy.task('db:userExists', email)
}


