/// <reference types="cypress" />

/**
 * Типы для кастомных Cypress tasks
 */
declare namespace Cypress {
  interface Tasks {
    /**
     * Очищает всю базу данных
     */
    'db:reset': () => Promise<null>
    
    /**
     * Создает пользователя в базе данных
     */
    'db:createUser': (data: { email: string; password: string; name: string }) => Promise<{ id: string; email: string; name: string }>
    
    /**
     * Удаляет пользователя по email
     */
    'db:deleteUser': (email: string) => Promise<null>
    
    /**
     * Получает пользователя по email
     */
    'db:getUser': (email: string) => Promise<{ id: string; email: string; name: string; createdAt: Date } | null>
    
    /**
     * Проверяет существование пользователя
     */
    'db:userExists': (email: string) => Promise<boolean>
  }
}


