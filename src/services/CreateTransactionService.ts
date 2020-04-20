import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome') {
      if (value > balance.total) {
        throw new AppError('Invalid balance', 400);
      }
    }

    const categoryRepository = getRepository(Category);
    // Verifica se categoria já existe
    let categoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    // Se não existe, cria um novo
    if (!categoryExist) {
      categoryExist = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryExist);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExist?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
