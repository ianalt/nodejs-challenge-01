import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8')
            .then((data) => {
                this.#database = JSON.parse(data)
            })
            .catch(() => {
                this.#persist()
            })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if (search) {
            data = data.filter((row) => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase()
                        .includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)

        if (rowIndex >= 0) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
        } else {
            throw new Error('Could not find task with provided ID')
        }

    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex((row) => row.id === id)

        if (rowIndex >= 0) {
            const task = this.#database[table][rowIndex]
            this.#database[table][rowIndex] = data ? { ...task, updatedAt: new Date(), ...data } : { ...task, updatedAt: new Date(), completedAt: new Date(), }
            this.#persist()
        } else {
            throw new Error('Could not find task with provided ID')
        }

    }
}