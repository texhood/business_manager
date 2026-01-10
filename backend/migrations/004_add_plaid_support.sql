CREATE TABLE plaid_items (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,  -- encrypted!
  item_id TEXT NOT NULL,
  institution_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plaid_accounts (
  id SERIAL PRIMARY KEY,
  plaid_item_id INT REFERENCES plaid_items(id),
  account_id TEXT NOT NULL,
  name TEXT,
  type TEXT,  -- checking, savings, credit
  mask TEXT   -- last 4 digits
);