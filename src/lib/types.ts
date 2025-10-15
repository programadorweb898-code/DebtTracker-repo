export type Debt = {
  id: string;
  amount: number;
  date: string; // ISO string for serialization
};

export type Debtor = {
  alias: string; // Unique identifier
  debts: Debt[];
};
