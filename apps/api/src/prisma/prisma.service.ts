import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type DeleteManyDelegate = {
  deleteMany: () => Promise<unknown>;
};

const hasDeleteMany = (value: unknown): value is DeleteManyDelegate => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as { deleteMany?: unknown };
  return typeof candidate.deleteMany === 'function';
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean database for testing (use with caution!)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }

    const modelKeys = Reflect.ownKeys(this).filter(
      (key): key is string =>
        typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    const clientRecord = this as Record<string, unknown>;
    return Promise.all(
      modelKeys.map((modelKey) => {
        const model = clientRecord[modelKey];
        if (hasDeleteMany(model)) {
          return model.deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
