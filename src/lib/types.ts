export type Debt = {
  id: string;
  amount: number;
  date: string; // ISO string for serialization
};

export type Debtor = {
  id: string; // Document ID from Firestore
  alias: string;
  totalDebt: number;
  ownerUid: string;
  debts: Debt[];
};
