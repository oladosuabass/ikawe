import { mockTitles } from '~/data/mock-titles'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const title = mockTitles.find((t) => t.id === id)

  if (!title) {
    throw createError({ statusCode: 404, statusMessage: 'Title not found' })
  }

  return title
})
