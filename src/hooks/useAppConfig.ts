import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureDefaultConfig } from '@/db';
import type { AppConfig, Person } from '@/types';
import { DEFAULT_CONFIG } from '@/types';

/**
 * Hook réactif qui fournit la configuration de l'application.
 * Se met à jour automatiquement quand IndexedDB change.
 */
export function useAppConfig() {
  const config = useLiveQuery(
    () => db.appConfig.get(1),
    [],
    DEFAULT_CONFIG
  );

  const updateConfig = async (updates: Partial<Omit<AppConfig, 'id'>>) => {
    await ensureDefaultConfig();
    await db.appConfig.update(1, updates);
  };

  const addPerson = async (name: string, color: string) => {
    const current = await db.appConfig.get(1) ?? DEFAULT_CONFIG;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const newPerson: Person = {
      id,
      name,
      color,
      order: current.persons.length,
    };
    await db.appConfig.update(1, {
      persons: [...current.persons, newPerson],
    });
  };

  const removePerson = async (personId: string) => {
    const current = await db.appConfig.get(1) ?? DEFAULT_CONFIG;
    await db.appConfig.update(1, {
      persons: current.persons
        .filter((p) => p.id !== personId)
        .map((p, i) => ({ ...p, order: i })),
    });
  };

  return {
    config: config ?? DEFAULT_CONFIG,
    persons: (config ?? DEFAULT_CONFIG).persons,
    lockHoursBefore: (config ?? DEFAULT_CONFIG).lockHoursBefore,
    updateConfig,
    addPerson,
    removePerson,
  };
}
