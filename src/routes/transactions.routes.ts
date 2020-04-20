import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repo = getCustomRepository(TransactionsRepository);
  const balance = await repo.getBalance();

  const transactions = await repo.find();

  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const tranService = new CreateTransactionService();
  const newCategory = await tranService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(newCategory);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteService = new DeleteTransactionService();

  await deleteService.execute(id);

  return response.status(201).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const file = request.file.filename;

    const importService = new ImportTransactionsService();

    await importService.execute({
      file,
    });

    response.status(200).send();
  },
);

export default transactionsRouter;
