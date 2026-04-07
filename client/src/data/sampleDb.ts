// SQL to create the investigation database used in challenges
export const INVESTIGATION_DB_SQL = `
  CREATE TABLE suspects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    occupation TEXT,
    criminal_record INTEGER DEFAULT 0,
    registered_at TEXT
  );

  CREATE TABLE crimes (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT,
    city TEXT,
    date TEXT,
    financial_loss REAL DEFAULT 0,
    solved INTEGER DEFAULT 0
  );

  CREATE TABLE suspect_crimes (
    suspect_id INTEGER REFERENCES suspects(id),
    crime_id INTEGER REFERENCES crimes(id),
    role TEXT DEFAULT 'suspect',
    PRIMARY KEY (suspect_id, crime_id)
  );

  CREATE TABLE evidence (
    id INTEGER PRIMARY KEY,
    crime_id INTEGER REFERENCES crimes(id),
    type TEXT,
    description TEXT,
    found_at TEXT,
    importance TEXT DEFAULT 'medium'
  );

  CREATE TABLE detectives (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    rank TEXT,
    cases_solved INTEGER DEFAULT 0,
    hire_date TEXT
  );

  CREATE TABLE case_assignments (
    detective_id INTEGER REFERENCES detectives(id),
    crime_id INTEGER REFERENCES crimes(id),
    assigned_at TEXT,
    PRIMARY KEY (detective_id, crime_id)
  );

  -- Suspects
  INSERT INTO suspects VALUES (1, 'Carlos Silva', 34, 'São Paulo', 'Programador', 0, '2024-01-15');
  INSERT INTO suspects VALUES (2, 'Maria Santos', 28, 'Rio de Janeiro', 'Contadora', 1, '2024-02-20');
  INSERT INTO suspects VALUES (3, 'João Oliveira', 45, 'São Paulo', 'Empresário', 2, '2024-01-10');
  INSERT INTO suspects VALUES (4, 'Ana Costa', 31, 'Belo Horizonte', 'Advogada', 0, '2024-03-05');
  INSERT INTO suspects VALUES (5, 'Pedro Souza', 52, 'São Paulo', 'Investidor', 3, '2024-01-20');
  INSERT INTO suspects VALUES (6, 'Lucia Ferreira', 29, 'Rio de Janeiro', 'Analista', 0, '2024-04-12');
  INSERT INTO suspects VALUES (7, 'Roberto Almeida', NULL, 'Curitiba', 'Desconhecido', 1, '2024-02-28');
  INSERT INTO suspects VALUES (8, 'Fernanda Lima', 38, 'São Paulo', 'Diretora', 0, '2024-05-01');
  INSERT INTO suspects VALUES (9, 'Lucas Pereira', 26, 'Belo Horizonte', 'Estagiário', 0, NULL);
  INSERT INTO suspects VALUES (10, 'Patricia Rocha', 41, 'Rio de Janeiro', 'Gerente', 2, '2024-03-15');
  INSERT INTO suspects VALUES (11, 'André Mendes', 33, 'Curitiba', NULL, 0, '2024-06-01');
  INSERT INTO suspects VALUES (12, 'Camila Barbosa', 36, 'São Paulo', 'Consultora', 1, '2024-01-25');

  -- Crimes
  INSERT INTO crimes VALUES (1, 'Fraude', 'Fraude bancária digital', 'São Paulo', '2024-03-10', 150000.00, 1);
  INSERT INTO crimes VALUES (2, 'Invasão', 'Invasão de sistema corporativo', 'Rio de Janeiro', '2024-04-15', 50000.00, 0);
  INSERT INTO crimes VALUES (3, 'Lavagem', 'Lavagem de dinheiro via crypto', 'São Paulo', '2024-02-20', 500000.00, 0);
  INSERT INTO crimes VALUES (4, 'Fraude', 'Falsificação de documentos', 'Belo Horizonte', '2024-05-01', 25000.00, 1);
  INSERT INTO crimes VALUES (5, 'Roubo', 'Roubo de dados pessoais', 'Curitiba', '2024-06-12', 80000.00, 0);
  INSERT INTO crimes VALUES (6, 'Fraude', 'Fraude em licitação', 'São Paulo', '2024-01-30', 300000.00, 1);
  INSERT INTO crimes VALUES (7, 'Invasão', 'Ataque DDoS a infraestrutura', 'Rio de Janeiro', '2024-07-20', 120000.00, 0);
  INSERT INTO crimes VALUES (8, 'Extorsão', 'Ransomware corporativo', 'São Paulo', '2024-08-05', 200000.00, 0);
  INSERT INTO crimes VALUES (9, 'Roubo', 'Roubo de propriedade intelectual', 'Belo Horizonte', '2024-03-25', 1000000.00, 0);
  INSERT INTO crimes VALUES (10, 'Fraude', 'Phishing em massa', 'Curitiba', '2024-09-10', 45000.00, 1);

  -- Suspect-Crime links
  INSERT INTO suspect_crimes VALUES (1, 2, 'suspect');
  INSERT INTO suspect_crimes VALUES (2, 1, 'accomplice');
  INSERT INTO suspect_crimes VALUES (3, 3, 'mastermind');
  INSERT INTO suspect_crimes VALUES (3, 6, 'mastermind');
  INSERT INTO suspect_crimes VALUES (4, 4, 'suspect');
  INSERT INTO suspect_crimes VALUES (5, 3, 'accomplice');
  INSERT INTO suspect_crimes VALUES (5, 6, 'suspect');
  INSERT INTO suspect_crimes VALUES (5, 8, 'mastermind');
  INSERT INTO suspect_crimes VALUES (6, 2, 'suspect');
  INSERT INTO suspect_crimes VALUES (7, 5, 'suspect');
  INSERT INTO suspect_crimes VALUES (8, 8, 'accomplice');
  INSERT INTO suspect_crimes VALUES (10, 1, 'mastermind');
  INSERT INTO suspect_crimes VALUES (10, 7, 'suspect');
  INSERT INTO suspect_crimes VALUES (12, 6, 'accomplice');
  INSERT INTO suspect_crimes VALUES (12, 9, 'suspect');

  -- Evidence
  INSERT INTO evidence VALUES (1, 1, 'digital', 'Logs de transação bancária', '2024-03-11', 'high');
  INSERT INTO evidence VALUES (2, 1, 'document', 'Contrato falsificado', '2024-03-12', 'high');
  INSERT INTO evidence VALUES (3, 2, 'digital', 'IP de acesso suspeito', '2024-04-16', 'medium');
  INSERT INTO evidence VALUES (4, 3, 'financial', 'Movimentação crypto', '2024-02-21', 'high');
  INSERT INTO evidence VALUES (5, 3, 'document', 'Conta offshore', '2024-02-25', 'high');
  INSERT INTO evidence VALUES (6, 4, 'document', 'Documento falsificado', '2024-05-02', 'medium');
  INSERT INTO evidence VALUES (7, 5, 'digital', 'Malware encontrado', '2024-06-13', 'high');
  INSERT INTO evidence VALUES (8, 6, 'financial', 'Pagamento irregular', '2024-02-01', 'medium');
  INSERT INTO evidence VALUES (9, 7, 'digital', 'Logs de ataque', '2024-07-21', 'low');
  INSERT INTO evidence VALUES (10, 8, 'digital', 'Código do ransomware', '2024-08-06', 'high');
  INSERT INTO evidence VALUES (11, 9, 'document', 'Patente copiada', '2024-03-26', 'high');
  INSERT INTO evidence VALUES (12, 10, 'digital', 'Templates de phishing', '2024-09-11', 'medium');

  -- Detectives
  INSERT INTO detectives VALUES (1, 'Inspetor Garcia', 'Inspetor', 15, '2020-01-10');
  INSERT INTO detectives VALUES (2, 'Detetive Nakamura', 'Detetive Sênior', 8, '2021-06-15');
  INSERT INTO detectives VALUES (3, 'Agente Torres', 'Detetive Junior', 3, '2023-03-01');
  INSERT INTO detectives VALUES (4, 'Detetive Park', 'Detetive Sênior', 12, '2019-11-20');
  INSERT INTO detectives VALUES (5, 'Recruta Silva', 'Estagiário', 0, '2024-09-01');

  -- Case assignments
  INSERT INTO case_assignments VALUES (1, 1, '2024-03-10');
  INSERT INTO case_assignments VALUES (1, 3, '2024-02-20');
  INSERT INTO case_assignments VALUES (2, 2, '2024-04-15');
  INSERT INTO case_assignments VALUES (2, 5, '2024-06-12');
  INSERT INTO case_assignments VALUES (3, 4, '2024-05-01');
  INSERT INTO case_assignments VALUES (3, 10, '2024-09-10');
  INSERT INTO case_assignments VALUES (4, 6, '2024-01-30');
  INSERT INTO case_assignments VALUES (4, 7, '2024-07-20');
  INSERT INTO case_assignments VALUES (4, 8, '2024-08-05');
  INSERT INTO case_assignments VALUES (4, 9, '2024-03-25');
`;
