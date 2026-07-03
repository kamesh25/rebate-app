import type { ReturnItem } from './types'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  // Use local date parts — avoids UTC shift bug
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function loadDemoData(): ReturnItem[] {
  return [
    {
      id: 'demo-1',
      store: 'Apple',
      item: 'MagSafe Charger',
      purchaseDate: daysAgo(13),  // 14-day policy → 1 day left
      returnDays: 14,
      pricePaid: 39.00,
      notes: 'Still sealed. Keep the box.',
      returned: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      store: 'Best Buy',
      item: 'Sony WH-1000XM5 Headphones',
      purchaseDate: daysAgo(13),  // 15-day policy → 2 days left
      returnDays: 15,
      pricePaid: 349.99,
      notes: 'Receipt in email. Order #BB-2847291',
      returned: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      store: 'Amazon',
      item: 'Instant Pot Duo 7-in-1, 6 Quart',
      purchaseDate: daysAgo(25),  // 30-day policy → 5 days left
      returnDays: 30,
      pricePaid: 79.95,
      notes: 'Box unopened, free return label in app',
      returned: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      store: 'Target',
      item: "Levi's 511 Slim Jeans — 32x30",
      purchaseDate: daysAgo(10),  // 90-day policy → safe
      returnDays: 90,
      pricePaid: 54.99,
      notes: '',
      returned: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      store: 'Walmart',
      item: 'Ninja Air Fryer XL',
      purchaseDate: daysAgo(60),
      returnDays: 90,
      pricePaid: 129.00,
      refundAmount: 129.00,
      notes: '',
      returned: true,
      createdAt: new Date().toISOString(),
    },
  ]
}
