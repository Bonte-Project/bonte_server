import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();
