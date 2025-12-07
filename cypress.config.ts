import { defineConfig } from 'cypress'
import { PrismaClient } from '@prisma/client'
import * as path from 'path'

export default defineConfig({
  e2e: {
    // Локальный URL приложения
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Инициализация Prisma для работы с БД
      // Путь к БД относительно корня проекта
      const dbPath = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: dbPath,
          },
        },
      })

      // Task для очистки БД
      on('task', {
        async 'db:reset'() {
          try {
            // Удаляем данные в правильном порядке (из-за foreign keys)
            await prisma.task.deleteMany()
            await prisma.teamMember.deleteMany()
            await prisma.team.deleteMany()
            await prisma.user.deleteMany()
            return null
          } catch (error) {
            console.error('Error resetting database:', error)
            throw error
          }
        },

        // Task для создания тестового пользователя
        async 'db:createUser'(data: { email: string; password: string; name: string }) {
          try {
            const bcrypt = require('bcryptjs')
            const hashedPassword = await bcrypt.hash(data.password, 10)
            const user = await prisma.user.create({
              data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
              },
            })
            return { id: user.id, email: user.email, name: user.name }
          } catch (error) {
            console.error('Error creating user:', error)
            throw error
          }
        },

        // Task для удаления пользователя по email
        async 'db:deleteUser'(email: string) {
          try {
            await prisma.user.deleteMany({
              where: { email },
            })
            return null
          } catch (error) {
            console.error('Error deleting user:', error)
            throw error
          }
        },

        // Task для получения пользователя по email
        async 'db:getUser'(email: string) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
              },
            })
            return user
          } catch (error) {
            console.error('Error getting user:', error)
            throw error
          }
        },

        // Task для проверки существования пользователя
        async 'db:userExists'(email: string) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            })
            return !!user
          } catch (error) {
            console.error('Error checking user:', error)
            throw error
          }
        },
      })

      // Закрываем соединение с БД при завершении
      on('after:run', async () => {
        await prisma.$disconnect()
      })

      return config
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    // Увеличиваем таймауты для работы с БД
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  env: {
    // Переменные окружения для использования в тестах
    DATABASE_URL: process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
    BASE_URL: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
  },
})

