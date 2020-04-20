import fs from 'fs';
import path from 'path';
import csvtojson from 'csvtojson';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

interface Request {
  file: string;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    const fileName = path.join(uploadConfig.directory, file);

    const csv_exists = await fs.promises.stat(fileName);

    if (!csv_exists) {
      throw new AppError('File not found', 404);
    }

    const imports = await csvtojson().fromFile(fileName);
    fs.unlinkSync(fileName);

    const createTransaction = new CreateTransactionService();

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < imports.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      await createTransaction.execute({
        title: imports[index].title,
        type: imports[index].type,
        value: imports[index].value,
        category: imports[index].category,
      });
    }

    return imports;
  }
}

export default ImportTransactionsService;
