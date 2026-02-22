// the thing inside curly braces is the generated prisma client
//the things we write inside curly braces is calles distructing it return the specific thing we want, this thing is that which return the exported value from the module/object

const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

module.exports = prisma;