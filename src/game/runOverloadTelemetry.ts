import type { OverloadSource } from './overload';

export interface RunOverloadTelemetry {
  passiveTotal: number;
  hitTotal: number;
}

const telemetry: RunOverloadTelemetry = {
  passiveTotal: 0,
  hitTotal: 0,
};

export function resetRunOverloadTelemetry(): void {
  telemetry.passiveTotal = 0;
  telemetry.hitTotal = 0;
}

export function recordOverloadDelta(delta: number, source: OverloadSource): void {
  if (delta <= 0) return;
  if (source === 'time') {
    telemetry.passiveTotal += delta;
    return;
  }
  telemetry.hitTotal += delta;
}

export function getRunOverloadTelemetry(): Readonly<RunOverloadTelemetry> {
  return telemetry;
}
