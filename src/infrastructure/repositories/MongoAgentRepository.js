import { IAgentRepository } from '../../domain/repositories/IAgentRepository.js';
import { Agent } from '../../domain/entities/Agent.js';

/**
 * MongoDB Agent Repository
 * Implementación de persistencia en MongoDB para agentes
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class MongoAgentRepository extends IAgentRepository {
  constructor(database) {
    super();
    this.collection = database.collection('agents');
  }

  async getAll() {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => new Agent(doc));
  }

  async getById(id) {
    const doc = await this.collection.findOne({ id });
    return doc ? new Agent(doc) : null;
  }

  async getActiveAgents() {
    const docs = await this.collection.find({ active: true }).toArray();
    return docs.map(doc => new Agent(doc));
  }

  async save(agent) {
    await this.collection.updateOne(
      { id: agent.id },
      { $set: agent.toJSON() },
      { upsert: true }
    );
    return agent;
  }

  async saveAll(agents) {
    const operations = agents.map(agent => ({
      updateOne: {
        filter: { id: agent.id },
        update: { $set: agent.toJSON() },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await this.collection.bulkWrite(operations);
    }

    return agents;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clear() {
    await this.collection.deleteMany({});
  }

  async count() {
    return await this.collection.countDocuments();
  }
}
