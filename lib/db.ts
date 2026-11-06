import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';import path from 'node:path';
const dir=process.env.ACADEMY_DATA_DIR||path.join(process.cwd(),'academy-data');fs.mkdirSync(dir,{recursive:true});
const db=new DatabaseSync(path.join(dir,'academy.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS courses(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',category TEXT NOT NULL DEFAULT 'Cybersegurança',cover TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS lessons(id INTEGER PRIMARY KEY AUTOINCREMENT,course_id INTEGER NOT NULL REFERENCES courses(id),module TEXT NOT NULL DEFAULT 'Módulo 1',title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',video TEXT NOT NULL DEFAULT '',duration TEXT NOT NULL DEFAULT '',position INTEGER NOT NULL DEFAULT 0,published INTEGER NOT NULL DEFAULT 0);`);
export default db;
