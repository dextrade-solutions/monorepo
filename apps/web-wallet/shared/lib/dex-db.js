import { openDB } from 'idb';

export const DEX_DB = 'dextrade-database';
export const DEX_STORE = 'data-store';
export const VERSION = 4;

export const openDexDB = () =>
  openDB(DEX_DB, VERSION, {
    upgrade(db) {
      db.createObjectStore(DEX_STORE);
    },
  });
