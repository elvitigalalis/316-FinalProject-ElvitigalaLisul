const {Sequelize, DataTypes, Model} = require("sequelize");

class PostgreDatabaseManager {
    constructor() {
        this.sequelize = new Sequelize(
            process.env.PG_DB_NAME,
            process.env.PG_USER,
            process.env.PG_PASSWORD,
            {
                host: process.env.PG_HOST,
                port: process.env.PG_PORT,
                dialect: "postgres",
                logging: false,
            }
        );
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            console.log("Connected to PostgreSQL database");
        } catch (e) {
            console.error ("Connection error (PostgreSQL)", e.message);
        }
    }

    getConnection() {
        return this.sequelize;
    }
}

module.exports = PostgreDatabaseManager;