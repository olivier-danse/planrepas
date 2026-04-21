import { useState, useEffect } from 'react';
import { supabase, rowToAppConfig } from '@/lib/supabase';
import type { AppConfig, Person } from '@/types';
import { DEFAULT_CONFIG } from '@/types';

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Chargement initial
    supabase
      .from('app_config')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setConfig(rowToAppConfig(data));
      });

    // Subscription temps réel
    const channel = supabase
      .channel('app_config')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' },
        (payload) => {
          setConfig(rowToAppConfig(payload.new as never));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateConfig = async (updates: Partial<Omit<AppConfig, 'id'>>) => {
    const row: Record<string, unknown> = {};
    if (updates.persons !== undefined) row.persons = updates.persons;
    if (updates.lockHoursBefore !== undefined) row.lock_hours_before = updates.lockHoursBefore;
    await supabase.from('app_config').update(row).eq('id', 1);
  };

  const addPerson = async (name: string, color: string) => {
    const newPerson: Person = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
      order: config.persons.length,
    };
    await updateConfig({ persons: [...config.persons, newPerson] });
  };

  const removePerson = async (personId: string) => {
    const persons = config.persons
      .filter((p) => p.id !== personId)
      .map((p, i) => ({ ...p, order: i }));
    await updateConfig({ persons });
  };

  return {
    config,
    persons: config.persons,
    lockHoursBefore: config.lockHoursBefore,
    updateConfig,
    addPerson,
    removePerson,
  };
}
