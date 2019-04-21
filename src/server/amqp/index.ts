import { Connection } from '@bernardjkim/amqplib';
import { rabbit } from '../../config/config';

const { host, port } = rabbit;
const mqClient = new Connection(`amqp://${host}:${port}`);
const exchange = mqClient.declareExchange('api', 'topic');

export { mqClient, exchange };
