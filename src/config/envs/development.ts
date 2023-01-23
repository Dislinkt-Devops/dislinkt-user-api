export const config = {
  db: {
    type: process.env.DB_TYPE,
    synchronize: true,
    // logging: true,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    autoLoadEntities: true,
  },
  apiKey: process.env.API_KEY
};
