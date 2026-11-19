/**
 * Pre-populated Mock Data for Instant Out-of-the-Box Demo
 * Contains two realistic, rich events:
 * 1. "Goa Beach Trip 2026" (Friends pool with Manager Rohan)
 * 2. "Rahul & Sneha's Wedding Gift Pool" (Collaborative gift registry pool)
 */

export const INITIAL_DEMO_EVENTS = [
  {
    id: 'evt-goa-2026',
    title: 'Goa Beach Trip 2026',
    description: '4-day annual friends beach getaway in Vagator & South Goa. Beach villa, scooties, shacks, and watersports.',
    category: 'trip',
    currency: 'INR',
    status: 'active',
    created_at: '2026-03-10T10:00:00Z',
    participants: [
      { id: 'p-rohan', name: 'Rohan Sharma', is_manager: true, upi_id: 'rohan@oksbi', color: '#2563eb' },
      { id: 'p-aman', name: 'Aman Verma', is_manager: false, upi_id: 'aman@icici', color: '#0d9488' },
      { id: 'p-priya', name: 'Priya Nair', is_manager: false, upi_id: 'priya@okhdfc', color: '#ec4899' },
      { id: 'p-kabir', name: 'Kabir Mehta', is_manager: false, upi_id: 'kabir@paytm', color: '#f59e0b' },
      { id: 'p-ananya', name: 'Ananya Roy', is_manager: false, upi_id: 'ananya@axis', color: '#8b5cf6' },
    ],
    transactions: [
      // 1. Initial Pool Deposits
      {
        id: 'tx-dep-1',
        type: 'pool_deposit',
        title: 'Initial Pool Deposit',
        category: 'misc',
        amount: 5000,
        quantity: 1,
        paid_by_id: 'p-aman',
        manager_id: 'p-rohan',
        date: '2026-03-10',
        notes: 'UPI transfer for Goa trip pool',
      },
      {
        id: 'tx-dep-2',
        type: 'pool_deposit',
        title: 'Initial Pool Deposit',
        category: 'misc',
        amount: 5000,
        quantity: 1,
        paid_by_id: 'p-priya',
        manager_id: 'p-rohan',
        date: '2026-03-10',
        notes: 'Google Pay to Rohan',
      },
      {
        id: 'tx-dep-3',
        type: 'pool_deposit',
        title: 'Initial Pool Deposit',
        category: 'misc',
        amount: 5000,
        quantity: 1,
        paid_by_id: 'p-kabir',
        manager_id: 'p-rohan',
        date: '2026-03-11',
        notes: 'Paytm to Rohan',
      },
      {
        id: 'tx-dep-4',
        type: 'pool_deposit',
        title: 'Initial Pool Deposit',
        category: 'misc',
        amount: 5000,
        quantity: 1,
        paid_by_id: 'p-ananya',
        manager_id: 'p-rohan',
        date: '2026-03-11',
        notes: 'PhonePe to Rohan',
      },
      {
        id: 'tx-dep-5',
        type: 'pool_deposit',
        title: 'Manager Own Pool Deposit',
        category: 'misc',
        amount: 5000,
        quantity: 1,
        paid_by_id: 'p-rohan',
        manager_id: 'p-rohan',
        date: '2026-03-11',
        notes: 'Rohan personal share into pool',
      },
      // 2. Pool Expenses (Paid by Manager Rohan from Pool)
      {
        id: 'tx-exp-1',
        type: 'pool_expense',
        title: 'Vagator Heritage Villa (3 Nights)',
        category: 'accommodation',
        amount: 14000,
        quantity: 1,
        paid_by_id: 'p-rohan',
        manager_id: 'p-rohan',
        date: '2026-03-12',
        notes: 'Advance booking paid from group pool',
        split_between: ['p-rohan', 'p-aman', 'p-priya', 'p-kabir', 'p-ananya']
      },
      {
        id: 'tx-exp-2',
        type: 'pool_expense',
        title: 'Fisherman’s Wharf Seafood Dinner',
        category: 'food',
        amount: 3500,
        quantity: 1,
        paid_by_id: 'p-rohan',
        manager_id: 'p-rohan',
        date: '2026-03-13',
        notes: 'Full dinner + mocktails bill paid from pool',
        split_between: ['p-rohan', 'p-aman', 'p-priya', 'p-kabir', 'p-ananya']
      },
      {
        id: 'tx-exp-3',
        type: 'pool_expense',
        title: '5x Activa Scooty Rentals + Petrol',
        category: 'travel',
        amount: 3000,
        quantity: 5,
        paid_by_id: 'p-rohan',
        manager_id: 'p-rohan',
        date: '2026-03-13',
        notes: '3 days bike rentals + full tank fuel',
        split_between: ['p-rohan', 'p-aman', 'p-priya', 'p-kabir', 'p-ananya']
      },
      // 3. Direct Out-of-Pocket Expenses (Paid directly by friends)
      {
        id: 'tx-dir-1',
        type: 'direct_expense',
        title: 'Scuba Diving & Jet Ski at Grande Island',
        category: 'activities',
        amount: 6000,
        quantity: 4,
        paid_by_id: 'p-kabir',
        date: '2026-03-14',
        notes: 'Kabir swiped his card directly. Rohan stayed back so split between 4 only.',
        split_between: ['p-aman', 'p-priya', 'p-kabir', 'p-ananya']
      },
      {
        id: 'tx-dir-2',
        type: 'direct_expense',
        title: 'Curlies Sunset Drinks & Shacks Platter',
        category: 'food',
        amount: 2500,
        quantity: 1,
        paid_by_id: 'p-priya',
        date: '2026-03-14',
        notes: 'Priya paid directly via UPI at shack',
        split_between: ['p-rohan', 'p-aman', 'p-priya', 'p-kabir', 'p-ananya']
      }
    ]
  },
  {
    id: 'evt-wedding-2026',
    title: "Rahul's Wedding Gift Pool",
    description: 'Pooling money from college gang to buy luxury wedding registry gifts for Rahul & Sneha.',
    category: 'wedding_gift',
    currency: 'INR',
    status: 'active',
    created_at: '2026-04-01T12:00:00Z',
    participants: [
      { id: 'p-priya-w', name: 'Priya (Gift Lead)', is_manager: true, upi_id: 'priya@okhdfc', color: '#ec4899' },
      { id: 'p-vikram', name: 'Vikram Joshi', is_manager: false, upi_id: 'vikram@axis', color: '#0ea5e9' },
      { id: 'p-rohan-w', name: 'Rohan Sharma', is_manager: false, upi_id: 'rohan@oksbi', color: '#2563eb' },
      { id: 'p-sneham', name: 'Sneha Malviya', is_manager: false, upi_id: 'sneha@ybl', color: '#f43f5e' },
      { id: 'p-tanvi', name: 'Tanvi Shah', is_manager: false, upi_id: 'tanvi@icici', color: '#10b981' },
      { id: 'p-ankit', name: 'Ankit Gupta', is_manager: false, upi_id: 'ankit@paytm', color: '#f59e0b' }
    ],
    transactions: [
      {
        id: 'tx-w-dep-1',
        type: 'pool_deposit',
        title: 'Wedding Gift Fund Contribution',
        category: 'gift',
        amount: 8000,
        quantity: 1,
        paid_by_id: 'p-vikram',
        manager_id: 'p-priya-w',
        date: '2026-04-02',
        notes: 'Pool contribution'
      },
      {
        id: 'tx-w-dep-2',
        type: 'pool_deposit',
        title: 'Wedding Gift Fund Contribution',
        category: 'gift',
        amount: 8000,
        quantity: 1,
        paid_by_id: 'p-rohan-w',
        manager_id: 'p-priya-w',
        date: '2026-04-02',
        notes: 'Pool contribution'
      },
      {
        id: 'tx-w-dep-3',
        type: 'pool_deposit',
        title: 'Wedding Gift Fund Contribution',
        category: 'gift',
        amount: 8000,
        quantity: 1,
        paid_by_id: 'p-sneham',
        manager_id: 'p-priya-w',
        date: '2026-04-02',
        notes: 'Pool contribution'
      },
      {
        id: 'tx-w-dep-4',
        type: 'pool_deposit',
        title: 'Wedding Gift Fund Contribution',
        category: 'gift',
        amount: 8000,
        quantity: 1,
        paid_by_id: 'p-tanvi',
        manager_id: 'p-priya-w',
        date: '2026-04-03',
        notes: 'Pool contribution'
      },
      {
        id: 'tx-w-dep-5',
        type: 'pool_deposit',
        title: 'Wedding Gift Fund Contribution',
        category: 'gift',
        amount: 8000,
        quantity: 1,
        paid_by_id: 'p-priya-w',
        manager_id: 'p-priya-w',
        date: '2026-04-03',
        notes: 'Priya own share into pool'
      },
      // Gift Purchases from Pool
      {
        id: 'tx-w-exp-1',
        type: 'pool_expense',
        title: "De'Longhi Magnifica Espresso Coffee Machine",
        category: 'gift',
        amount: 22000,
        quantity: 1,
        paid_by_id: 'p-priya-w',
        manager_id: 'p-priya-w',
        date: '2026-04-05',
        notes: 'Purchased from Amazon Wedding Registry from pool funds',
        split_between: ['p-priya-w', 'p-vikram', 'p-rohan-w', 'p-sneham', 'p-tanvi', 'p-ankit']
      },
      {
        id: 'tx-w-exp-2',
        type: 'pool_expense',
        title: 'Taj Exotica Maldives Honeymoon Spa Voucher',
        category: 'gift',
        amount: 15000,
        quantity: 1,
        paid_by_id: 'p-priya-w',
        manager_id: 'p-priya-w',
        date: '2026-04-06',
        notes: 'Luxury voucher paid from pool',
        split_between: ['p-priya-w', 'p-vikram', 'p-rohan-w', 'p-sneham', 'p-tanvi', 'p-ankit']
      },
      // Direct spend by Vikram
      {
        id: 'tx-w-dir-1',
        type: 'direct_expense',
        title: 'Personalized Custom Handcrafted Wooden Keepsake Box',
        category: 'gift',
        amount: 3600,
        quantity: 1,
        paid_by_id: 'p-vikram',
        date: '2026-04-07',
        notes: 'Vikram ordered and paid artisan directly',
        split_between: ['p-priya-w', 'p-vikram', 'p-rohan-w', 'p-sneham', 'p-tanvi', 'p-ankit']
      }
    ]
  }
];
