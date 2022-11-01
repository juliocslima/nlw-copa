import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';

type Pools = {
  title: string;
}

const prisma = new PrismaClient({
  log: ['query'],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  })

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count();

    return { count }
  });

  fastify.get('/users/count', async () => {
    const count = await prisma.user.count();

    return { count }
  });

  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count();

    return { count }
  });

  fastify.post('/pools', async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });

    try {
      const { title } = createPoolBody.parse(request.body);

      const generate = new ShortUniqueId({ length: 6 });
      const code = String(generate()).toUpperCase();

      await prisma.pool.create({
        data: {
          title,
          code,
        }
      })

      reply.code(201).send({ code });
    } catch (error) {
      reply.code(400).send({ error });
    }
  });

  await fastify.listen({ port: 3333, host: '0.0.0.0' });
}

bootstrap();