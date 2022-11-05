/// <reference lib="webworker" />

import { PeriodicElement } from './table.data';

addEventListener('message', calculAggregate);

function calculAggregate(event: any): void {
  const { data } = event;
  const periodicElements: PeriodicElement[] = data.periodicElements;
  const messageId = data.messageId;
  let aggregate = 0;
  for (let index = 0; index < 15000; index++) {
    periodicElements.forEach((element) => {
      aggregate += Math.log(element.weight ** 2);
    });
  }

  postMessage({ messageId, aggregate });
}
