import { Module as ModuleModel } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { ModuleRepository } from '../repositories/module.repository';

describe('ModuleRepository', () => {
  let repository: ModuleRepository;
  let prisma: {
    module: {
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
    };
  };

  const fakeModule = { id: 'module_1' } as ModuleModel;

  beforeEach(() => {
    prisma = {
      module: {
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new ModuleRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('includes the parent course', async () => {
      prisma.module.findUnique.mockResolvedValue(fakeModule);

      const result = await repository.findById('module_1');

      expect(prisma.module.findUnique).toHaveBeenCalledWith({
        where: { id: 'module_1' },
        include: { course: true },
      });
      expect(result).toBe(fakeModule);
    });
  });

  describe('countByCourse', () => {
    it('counts modules scoped to a course', async () => {
      prisma.module.count.mockResolvedValue(3);

      const result = await repository.countByCourse('course_1');

      expect(prisma.module.count).toHaveBeenCalledWith({
        where: { courseId: 'course_1' },
      });
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('passes data straight through to prisma', async () => {
      prisma.module.create.mockResolvedValue(fakeModule);
      const data = { courseId: 'course_1', title: 'Module 1', order: 0 };

      const result = await repository.create(data);

      expect(prisma.module.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(fakeModule);
    });
  });
});
