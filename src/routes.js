import { Database } from './database.js'
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'
import { buildBufferChunk } from './utils/build-buffer-chunk.js'

const database = new Database()

const UNPROCESSABLE_ENTITY_HTTP = 422
const CREATED_HTTP = 201
const NO_CONTENT_HTTP = 204
const NOT_FOUND_HTTP = 404
const INTERNAL_SERVER_ERROR_HTTP = 500


export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if (!req.body || !title || !description) {
                return res
                    .writeHead(UNPROCESSABLE_ENTITY_HTTP)
                    .end(buildBufferChunk({
                        status: UNPROCESSABLE_ENTITY_HTTP,
                        message: 'Title and/or description not provided'
                    }))
            }

            const task = {
                id: randomUUID(),
                createdAt: new Date(),
                updatedAt: null,
                title,
                description,
                completedAt: null,
            }

            database.insert('tasks', task)

            return res
                .writeHead(CREATED_HTTP)
                .end()
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query
            const tasks = database.select('tasks', search ? { title: search, description: search } : null)

            return res
                .setHeader('Content-Type', 'application/json')
                .end(JSON.stringify(tasks))
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { body } = req

            if (!body || !body.title || !body.description) {
                return res
                    .writeHead(UNPROCESSABLE_ENTITY_HTTP)
                    .end(buildBufferChunk({
                        status: UNPROCESSABLE_ENTITY_HTTP,
                        message: 'Title and/or description not provided'
                    }))
            }

            try {
                database.update('tasks', id, body)

                return res
                    .writeHead(CREATED_HTTP)
                    .end()
            } catch (e) {
                if (e instanceof Error) {
                    return res
                        .writeHead(NOT_FOUND_HTTP)
                        .end(buildBufferChunk({
                            status: NOT_FOUND_HTTP,
                            message: e.message
                        }))
                }

                return res
                    .writeHead(INTERNAL_SERVER_ERROR_HTTP)
                    .end(buildBufferChunk({
                        status: INTERNAL_SERVER_ERROR_HTTP,
                        message: 'An unknown error has happened'
                    }))
            }


        },
    },

    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            try {
                database.delete('tasks', id)

                return res.writeHead(NO_CONTENT_HTTP).end()
            } catch (e) {
                if (e instanceof Error) {
                    return res
                        .writeHead(NOT_FOUND_HTTP)
                        .end(buildBufferChunk({
                            status: NOT_FOUND_HTTP,
                            message: e.message
                        }))
                }

                return res
                    .writeHead(INTERNAL_SERVER_ERROR_HTTP)
                    .end(buildBufferChunk({
                        status: INTERNAL_SERVER_ERROR_HTTP,
                        message: 'An unknown error has happened'
                    }))
            }
        },
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params


            database.update('tasks', id, null)

            return res
                .writeHead(CREATED_HTTP)
                .end()


        },
    },


]