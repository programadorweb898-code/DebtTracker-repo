# **App Name**: DebtTracker

## Core Features:

- Register Debtor: Register a debtor with a unique alias, debt amount, and debt generation date.
- Accumulate Debt: Add new debt to an existing debtor's total debt if the previous debt hasn't been fully paid.
- Debt Cancellation: Remove the debtor from the database upon full cancellation of their debt.
- Filter Debtors: Filter debtors by name, debt amount (high to low and low to high), and debt amount range.
- Aggregate Metrics: Display the total number of debtors and the total debt amount across all debtors.
- Individual Debtor Details: Provide a dedicated page for each debtor, accessible via a unique URL, showing the history of debt generation dates and amounts.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) for a calm, trustworthy feel.
- Background color: Very light blue (#F0F8FF), almost white, complementing the primary color with a calm and clean background.
- Accent color: Muted purple (#BDB2FF) to highlight important interactive elements and create visual interest.
- Headline font: 'Space Grotesk' sans-serif for headings; body font: 'Inter' sans-serif for text, offering a balanced and readable layout.
- Use simple, line-based icons to represent different actions (e.g., add debt, filter, view details).
- Clean, card-based layout for displaying debtor information. Each card includes debtor alias, total debt amount, and actions.
- Subtle transitions when filtering debtors or updating debt amounts to provide a smooth user experience.