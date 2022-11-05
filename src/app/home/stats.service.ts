import { Injectable } from '@angular/core';
import { PeriodicElement } from './table.data';

let messageId = 0;

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private cache = new Map();
  private pending = new Map();
  private resolves = new Map();
  private worker = new Worker('./stats.worker', { type: 'module' }); // instantiate a new worker

  constructor() {
    this.worker.addEventListener('message', this.processResult.bind(this));
  }

  private processResult(event: any): void {
    const { data } = event;
    const { messageId, aggregate } = data;
    if (this.resolves.has(messageId)) {
      this.resolves.get(messageId)(aggregate);
    }
    this.resolves.delete(messageId);
  }

  calculate(periodicElements: PeriodicElement[]): Promise<number> | number {
    if (this.cache.has(periodicElements.toString())) {
      return this.cache.get(periodicElements.toString());
    }
    if (this.pending.has(periodicElements.toString())) {
      return this.pending.get(periodicElements.toString());
    }
    messageId++;
    this.worker.postMessage({ messageId: messageId, periodicElements: periodicElements });
    const pending = new Promise<number>(resolve => {
      this.resolves.set(messageId, resolve);
    }).then((aggregate) => {
      this.pending.delete(periodicElements.toString());
      this.cache.set(periodicElements.toString(), aggregate);
      return aggregate;
    });
    this.pending.set(periodicElements.toString(), pending);
    return pending;
  }
}
  
