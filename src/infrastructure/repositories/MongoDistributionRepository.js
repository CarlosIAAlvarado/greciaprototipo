import { IDistributionRepository } from '../../domain/repositories/IDistributionRepository.js';
import { Distribution } from '../../domain/entities/Distribution.js';

/**
 * MongoDB Distribution Repository
 * Implementación de persistencia en MongoDB para distribuciones
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class MongoDistributionRepository extends IDistributionRepository {
  constructor(database) {
    super();
    this.collection = database.collection('distributions');
  }

  async save(distribution) {
    await this.collection.updateOne(
      { id: distribution.id },
      { $set: distribution.toJSON() },
      { upsert: true }
    );
    return distribution;
  }

  async getLatest() {
    const doc = await this.collection
      .find({})
      .sort({ distributionDate: -1 })
      .limit(1)
      .toArray();

    return doc.length > 0 ? new Distribution(doc[0]) : null;
  }

  async getHistory(limit = 10) {
    const docs = await this.collection
      .find({})
      .sort({ distributionDate: -1 })
      .limit(limit)
      .toArray();

    return docs.map(doc => new Distribution(doc));
  }

  async getById(id) {
    const doc = await this.collection.findOne({ id });
    return doc ? new Distribution(doc) : null;
  }

  async clear() {
    await this.collection.deleteMany({});
  }

  async count() {
    return await this.collection.countDocuments();
  }
}
