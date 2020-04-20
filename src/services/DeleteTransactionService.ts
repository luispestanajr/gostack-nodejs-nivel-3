import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transRepository = getCustomRepository(TransactionRepository);

    const repoToDelete = await transRepository.findOne(id);

    if (!repoToDelete) {
      throw new AppError('Transaction not found', 401);
    }

    await transRepository.remove(repoToDelete);
  }
}

export default DeleteTransactionService;
