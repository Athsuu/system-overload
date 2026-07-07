import { useEffect, useState } from 'react';
import { getGameStrings, subscribeLocale, type GameStrings } from './index';

export function useGameStrings(): GameStrings {
  const [, setRevision] = useState(0);

  useEffect(() => subscribeLocale(() => setRevision((value) => value + 1)), []);

  return getGameStrings();
}
