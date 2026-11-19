/**
 * Settlement Engine & Financial Calculation Core
 *
 * Implements:
 * 1. Financial balance aggregation for 3 distinct transaction types:
 *    - Pool Deposits (Friend -> Manager)
 *    - Pool Expenses (Manager spends from pool on items)
 *    - Direct / Out-of-Pocket Expenses (Friend pays directly)
 * 2. Unspent Pool Cash reconciliation with Pool Manager(s)
 * 3. Minimum-transaction debt simplification algorithm (Min Cash Flow)
 * 4. Flow Graph data generation for interactive visual diagrams
 */

/**
 * Rounds a number to two decimal places
 */
export const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

/**
 * Computes all financial metrics, individual balances, and debt simplification
 *
 * @param {Array} participants - List of participant objects [{ id, name, is_manager, upi_id }]
 * @param {Array} transactions - List of transactions [{ id, type, amount, paid_by_id, manager_id, category, splits }]
 * @returns {Object} Comprehensive calculation result
 */
export function calculateEventFinances(participants = [], transactions = []) {
  if (!participants || participants.length === 0) {
    return {
      participantsSummary: [],
      settlements: [],
      totalPoolCollected: 0,
      totalSpent: 0,
      totalPoolSpent: 0,
      totalDirectSpent: 0,
      remainingPoolCash: 0,
      perPersonAverage: 0,
      categoryBreakdown: {},
      isBalanced: true,
      graphData: { nodes: [], edges: [] }
    };
  }

  // Map participant lookup
  const participantMap = new Map();
  participants.forEach(p => {
    participantMap.set(p.id, {
      id: p.id,
      name: p.name,
      isManager: Boolean(p.is_manager),
      upiId: p.upi_id || '',
      color: p.color || '#0d9488',
      poolDepositsMade: 0,      // Money this person deposited into the pool
      poolDepositsReceived: 0,  // (If manager) Money received into manager's pool
      directExpensesPaid: 0,    // Money paid directly out of pocket
      poolExpensesPaid: 0,      // (If manager) Money paid from pool for expenses
      totalContributed: 0,      // poolDepositsMade + directExpensesPaid
      totalExpenseShare: 0,     // Total share of items consumed/benefited
      cashInHand: 0,            // Physical cash currently held by this person (Manager)
      netBalance: 0,            // Contributed - ExpenseShare (Economic entitlement)
      settlementBalance: 0,     // Net balance adjusted for physical cash in hand
    });
  });

  let totalPoolCollected = 0;
  let totalPoolSpent = 0;
  let totalDirectSpent = 0;
  const categoryBreakdown = {};

  // Process all transactions
  transactions.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    const category = tx.category || 'misc';

    if (tx.type === 'pool_deposit') {
      // 1. POOL DEPOSIT: Friend -> Manager
      totalPoolCollected += amount;

      // Payer contributed to pool
      if (participantMap.has(tx.paid_by_id)) {
        participantMap.get(tx.paid_by_id).poolDepositsMade += amount;
      }

      // Manager holds the cash collected
      const mgrId = tx.manager_id || (participants.find(p => p.is_manager)?.id);
      if (mgrId && participantMap.has(mgrId)) {
        participantMap.get(mgrId).poolDepositsReceived += amount;
      }

    } else if (tx.type === 'pool_expense') {
      // 2. POOL EXPENSE: Manager spends from collected pool
      totalPoolSpent += amount;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;

      // Deduct from Manager's pool spending
      const mgrId = tx.manager_id || tx.paid_by_id || (participants.find(p => p.is_manager)?.id);
      if (mgrId && participantMap.has(mgrId)) {
        participantMap.get(mgrId).poolExpensesPaid += amount;
      }

      // Split cost among participants
      distributeExpenseSplit(tx, amount, participants, participantMap);

    } else if (tx.type === 'direct_expense') {
      // 3. DIRECT EXPENSE: Friend pays out of pocket directly
      totalDirectSpent += amount;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;

      if (participantMap.has(tx.paid_by_id)) {
        participantMap.get(tx.paid_by_id).directExpensesPaid += amount;
      }

      // Split cost among participants
      distributeExpenseSplit(tx, amount, participants, participantMap);
    }
  });

  const totalSpent = totalPoolSpent + totalDirectSpent;
  const remainingPoolCash = totalPoolCollected - totalPoolSpent;
  const perPersonAverage = participants.length > 0 ? round2(totalSpent / participants.length) : 0;

  // Finalize participant balance calculations
  const participantsSummary = Array.from(participantMap.values()).map(p => {
    // Total out-of-pocket money provided by this individual
    p.totalContributed = round2(p.poolDepositsMade + p.directExpensesPaid);
    p.totalExpenseShare = round2(p.totalExpenseShare);

    // Physical cash currently in their pocket from the pool
    // For a manager: deposits received minus pool expenses paid
    if (p.isManager) {
      p.cashInHand = round2(p.poolDepositsReceived - p.poolExpensesPaid);
    } else {
      p.cashInHand = 0;
    }

    // Net economic balance: what you contributed vs what you consumed
    // > 0 means you overpaid (owed money)
    // < 0 means you underpaid (you owe money)
    p.netBalance = round2(p.totalContributed - p.totalExpenseShare);

    // Settlement balance: adjusts for physical cash currently held!
    // Since Manager already holds `cashInHand` cash physically:
    // Manager needs to distribute that cash in hand to settle everyone.
    // Settlement Balance = NetBalance - CashInHand.
    // Sum of Settlement Balance across all participants equals exactly 0!
    p.settlementBalance = round2(p.netBalance - p.cashInHand);

    return p;
  });

  // Calculate minimum cash flow settlements
  const settlements = simplifyDebts(participantsSummary);

  // Generate visual graph data for money flows and settlements
  const flowGraph = generateMoneyFlowGraph(participants, transactions, settlements, remainingPoolCash);

  // Verify settlement integrity (sum of all settlement balances should be ~0)
  const balanceChecksum = round2(
    participantsSummary.reduce((sum, p) => sum + p.settlementBalance, 0)
  );

  return {
    participantsSummary,
    settlements,
    totalPoolCollected: round2(totalPoolCollected),
    totalSpent: round2(totalSpent),
    totalPoolSpent: round2(totalPoolSpent),
    totalDirectSpent: round2(totalDirectSpent),
    remainingPoolCash: round2(remainingPoolCash),
    perPersonAverage,
    categoryBreakdown,
    isBalanced: Math.abs(balanceChecksum) <= 0.05,
    flowGraph
  };
}

/**
 * Distributes transaction split amounts among participants
 */
function distributeExpenseSplit(tx, totalAmount, participants, participantMap) {
  // Check if explicit splits are provided
  if (Array.isArray(tx.splits) && tx.splits.length > 0) {
    tx.splits.forEach(split => {
      const pid = split.participant_id;
      const share = Number(split.share_amount) || 0;
      if (participantMap.has(pid)) {
        participantMap.get(pid).totalExpenseShare += share;
      }
    });
  } else if (Array.isArray(tx.split_between) && tx.split_between.length > 0) {
    // Equal split among selected subset
    const splitCount = tx.split_between.length;
    const sharePerPerson = totalAmount / splitCount;
    tx.split_between.forEach(pid => {
      if (participantMap.has(pid)) {
        participantMap.get(pid).totalExpenseShare += sharePerPerson;
      }
    });
  } else {
    // Default: Equal split among all participants
    const splitCount = participants.length;
    if (splitCount > 0) {
      const sharePerPerson = totalAmount / splitCount;
      participants.forEach(p => {
        if (participantMap.has(p.id)) {
          participantMap.get(p.id).totalExpenseShare += sharePerPerson;
        }
      });
    }
  }
}

/**
 * Debt Simplification Algorithm (Greedy Minimum Cash Flow)
 * Resolves all debts using the minimum number of direct transactions.
 *
 * @param {Array} participants - List of participants with settlementBalance
 * @returns {Array} List of settlement instructions: [{ from, fromName, to, toName, amount, toUpi }]
 */
export function simplifyDebts(participants = []) {
  // Creditors: settlementBalance > 0 (owed money)
  // Debtors: settlementBalance < 0 (owe money)
  const creditors = [];
  const debtors = [];

  participants.forEach(p => {
    const bal = round2(p.settlementBalance);
    if (bal > 0.01) {
      creditors.push({
        id: p.id,
        name: p.name,
        amount: bal,
        upiId: p.upiId,
        isManager: p.isManager
      });
    } else if (bal < -0.01) {
      debtors.push({
        id: p.id,
        name: p.name,
        amount: Math.abs(bal),
        upiId: p.upiId,
        isManager: p.isManager
      });
    }
  });

  // Sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = round2(Math.min(debtor.amount, creditor.amount));

    if (amount > 0.01) {
      settlements.push({
        fromId: debtor.id,
        fromName: debtor.name,
        fromIsManager: debtor.isManager,
        toId: creditor.id,
        toName: creditor.name,
        toIsManager: creditor.isManager,
        toUpi: creditor.upiId || '',
        amount: round2(amount),
        status: 'pending' // can be toggled by user in UI as 'settled'
      });
    }

    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}

/**
 * Generates structured diagram nodes and edges for visual rendering:
 * 1. Flow of Funds: Friends -> Pool Manager -> Expense Categories
 * 2. Settlement Network: Debtor -> Creditor payout directions
 */
export function generateMoneyFlowGraph(participants, transactions, settlements, remainingPoolCash) {
  const manager = participants.find(p => p.is_manager) || participants[0];

  // 1. POOL FLOW GRAPH
  const poolNodes = [];
  const poolEdges = [];

  // Central Manager Node
  if (manager) {
    poolNodes.push({
      id: `manager-${manager.id}`,
      type: 'manager',
      name: `${manager.name} (Manager Pool)`,
      subtext: `Remaining: ₹${round2(remainingPoolCash)}`,
      role: 'Manager',
      color: '#2563eb'
    });
  }

  // Friends Nodes (Depositors / Contributors)
  const friends = participants.filter(p => !p.is_manager);
  friends.forEach(f => {
    poolNodes.push({
      id: `friend-${f.id}`,
      type: 'friend',
      name: f.name,
      role: 'Participant',
      color: f.color || '#0d9488'
    });
  });

  // Pool Deposit Edges: Friend -> Manager
  transactions
    .filter(t => t.type === 'pool_deposit')
    .forEach((tx, idx) => {
      const payer = participants.find(p => p.id === tx.paid_by_id);
      if (payer && manager) {
        poolEdges.push({
          id: `deposit-edge-${idx}`,
          source: `friend-${payer.id}`,
          target: `manager-${manager.id}`,
          label: `₹${Number(tx.amount).toLocaleString('en-IN')}`,
          type: 'deposit',
          title: tx.title
        });
      }
    });

  // Category Nodes & Outflow Edges from Manager
  const categoryTotals = {};
  transactions
    .filter(t => t.type === 'pool_expense')
    .forEach(tx => {
      const cat = tx.category || 'misc';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount);
    });

  Object.entries(categoryTotals).forEach(([cat, amount], idx) => {
    const catNodeId = `category-${cat}`;
    poolNodes.push({
      id: catNodeId,
      type: 'category',
      name: cat.toUpperCase(),
      subtext: `Total: ₹${round2(amount).toLocaleString('en-IN')}`,
      role: 'Category',
      color: '#f59e0b'
    });

    if (manager) {
      poolEdges.push({
        id: `spend-edge-${idx}`,
        source: `manager-${manager.id}`,
        target: catNodeId,
        label: `₹${round2(amount).toLocaleString('en-IN')}`,
        type: 'spend',
        title: `Pool Spend: ${cat}`
      });
    }
  });

  // 2. SETTLEMENT GRAPH
  const settlementNodes = participants.map(p => ({
    id: `settle-p-${p.id}`,
    name: p.name,
    isManager: Boolean(p.is_manager),
    upiId: p.upi_id
  }));

  const settlementEdges = settlements.map((s, idx) => ({
    id: `settle-edge-${idx}`,
    source: `settle-p-${s.fromId}`,
    target: `settle-p-${s.toId}`,
    fromName: s.fromName,
    toName: s.toName,
    amount: s.amount,
    toUpi: s.toUpi
  }));

  return {
    poolFlow: { nodes: poolNodes, edges: poolEdges },
    settlementFlow: { nodes: settlementNodes, edges: settlementEdges }
  };
}
