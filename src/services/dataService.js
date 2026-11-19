/**
 * Unified Data Service with Supabase Cloud & LocalStorage Fallback
 * Provides persistent CRUD for Events, Participants, and Transactions
 */

import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import { INITIAL_DEMO_EVENTS } from './mockData';

const LOCAL_STORAGE_KEY = 'poolsplit_events_data_v1';

// Initialize local storage with mock demo data if empty
const getLocalEvents = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_EVENTS));
      return INITIAL_DEMO_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_EVENTS;
  } catch (err) {
    console.warn('Error reading from localStorage, using demo data', err);
    return INITIAL_DEMO_EVENTS;
  }
};

const saveLocalEvents = (events) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to localStorage', err);
  }
};

export const dataService = {
  isCloudConnected() {
    return getSupabaseConfig().isConfigured;
  },

  /**
   * Load all events with their participants and transactions
   */
  async getEvents() {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return getLocalEvents();
    }

    try {
      // 1. Fetch events
      const { data: events, error: evtErr } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (evtErr) throw evtErr;
      if (!events || events.length === 0) {
        // If Supabase table is empty, seed demo events into Supabase!
        await this.seedSupabaseDemo();
        return getLocalEvents();
      }

      // 2. Fetch participants and transactions for each event
      const fullEvents = await Promise.all(
        events.map(async (evt) => {
          const { data: participants } = await supabase
            .from('participants')
            .select('*')
            .eq('event_id', evt.id);

          const { data: transactions } = await supabase
            .from('transactions')
            .select(`
              *,
              splits:transaction_splits(*)
            `)
            .eq('event_id', evt.id)
            .order('date', { ascending: false });

          return {
            ...evt,
            participants: participants || [],
            transactions: (transactions || []).map(tx => ({
              ...tx,
              split_between: tx.splits?.map(s => s.participant_id) || []
            }))
          };
        })
      );

      // Also sync to local storage as backup cache
      saveLocalEvents(fullEvents);
      return fullEvents;
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to LocalStorage:', err.message);
      return getLocalEvents();
    }
  },

  /**
   * Create a new event
   */
  async createEvent(eventData) {
    const newId = `evt-${Date.now()}`;
    const newEvent = {
      id: newId,
      title: eventData.title.trim(),
      description: eventData.description || '',
      category: eventData.category || 'trip',
      currency: eventData.currency || 'INR',
      status: 'active',
      created_at: new Date().toISOString(),
      participants: eventData.participants || [
        { id: `p-mgr-${Date.now()}`, name: 'You (Manager)', is_manager: true, upi_id: '', color: '#2563eb' }
      ],
      transactions: []
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: createdEvt, error: eErr } = await supabase
          .from('events')
          .insert({
            title: newEvent.title,
            description: newEvent.description,
            category: newEvent.category,
            currency: newEvent.currency,
            status: 'active'
          })
          .select()
          .single();

        if (eErr) throw eErr;

        if (createdEvt && newEvent.participants.length > 0) {
          const partRows = newEvent.participants.map(p => ({
            event_id: createdEvt.id,
            name: p.name,
            upi_id: p.upi_id || '',
            is_manager: Boolean(p.is_manager),
            color: p.color || '#2563eb'
          }));

          const { data: insertedParts } = await supabase
            .from('participants')
            .insert(partRows)
            .select();

          newEvent.id = createdEvt.id;
          newEvent.participants = insertedParts || newEvent.participants;
        }
      } catch (err) {
        console.warn('Supabase createEvent failed, using local fallback:', err);
      }
    }

    // Always update local cache
    const events = getLocalEvents();
    const updated = [newEvent, ...events];
    saveLocalEvents(updated);
    return newEvent;
  },

  /**
   * Update an existing event
   */
  async updateEvent(eventId, patch) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('events')
          .update(patch)
          .eq('id', eventId);
      } catch (err) {
        console.warn('Supabase updateEvent error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => evt.id === eventId ? { ...evt, ...patch, updated_at: new Date().toISOString() } : evt);
    saveLocalEvents(updated);
    return updated.find(e => e.id === eventId);
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', eventId);
      } catch (err) {
        console.warn('Supabase deleteEvent error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.filter(evt => evt.id !== eventId);
    saveLocalEvents(updated);
    return updated;
  },

  /**
   * Add a participant to an event
   */
  async addParticipant(eventId, participantData) {
    const newParticipant = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: participantData.name.trim(),
      upi_id: participantData.upi_id || '',
      is_manager: Boolean(participantData.is_manager),
      color: participantData.color || '#0d9488'
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from('participants')
          .insert({
            event_id: eventId,
            name: newParticipant.name,
            upi_id: newParticipant.upi_id,
            is_manager: newParticipant.is_manager,
            color: newParticipant.color
          })
          .select()
          .single();

        if (!error && inserted) {
          newParticipant.id = inserted.id;
        }
      } catch (err) {
        console.warn('Supabase addParticipant error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          participants: [...(evt.participants || []), newParticipant]
        };
      }
      return evt;
    });
    saveLocalEvents(updated);
    return newParticipant;
  },

  /**
   * Update participant details (e.g. toggle Manager role, edit UPI id)
   */
  async updateParticipant(eventId, participantId, patch) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('participants')
          .update(patch)
          .eq('id', participantId);
      } catch (err) {
        console.warn('Supabase updateParticipant error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          participants: evt.participants.map(p => p.id === participantId ? { ...p, ...patch } : p)
        };
      }
      return evt;
    });
    saveLocalEvents(updated);
  },

  /**
   * Remove a participant from an event
   */
  async removeParticipant(eventId, participantId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('participants').delete().eq('id', participantId);
      } catch (err) {
        console.warn('Supabase removeParticipant error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          participants: evt.participants.filter(p => p.id !== participantId),
          transactions: evt.transactions.filter(t => t.paid_by_id !== participantId && t.manager_id !== participantId)
        };
      }
      return evt;
    });
    saveLocalEvents(updated);
  },

  /**
   * Add a new transaction (pool deposit, pool expense, or direct expense)
   */
  async addTransaction(eventId, txData) {
    const newTx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: txData.type,
      title: txData.title.trim(),
      category: txData.category || 'misc',
      amount: Number(txData.amount) || 0,
      quantity: Number(txData.quantity) || 1,
      paid_by_id: txData.paid_by_id,
      manager_id: txData.manager_id || null,
      date: txData.date || new Date().toISOString().split('T')[0],
      notes: txData.notes || '',
      split_between: txData.split_between || [],
      splits: txData.splits || []
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: createdTx, error } = await supabase
          .from('transactions')
          .insert({
            event_id: eventId,
            type: newTx.type,
            title: newTx.title,
            category: newTx.category,
            amount: newTx.amount,
            quantity: newTx.quantity,
            paid_by_id: newTx.paid_by_id,
            manager_id: newTx.manager_id,
            date: newTx.date,
            notes: newTx.notes
          })
          .select()
          .single();

        if (!error && createdTx) {
          newTx.id = createdTx.id;

          // Insert splits if applicable
          if (newTx.type !== 'pool_deposit' && newTx.split_between?.length > 0) {
            const share = newTx.amount / newTx.split_between.length;
            const splitRows = newTx.split_between.map(pid => ({
              transaction_id: createdTx.id,
              participant_id: pid,
              share_amount: share
            }));
            await supabase.from('transaction_splits').insert(splitRows);
          }
        }
      } catch (err) {
        console.warn('Supabase addTransaction error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          transactions: [newTx, ...(evt.transactions || [])]
        };
      }
      return evt;
    });
    saveLocalEvents(updated);
    return newTx;
  },

  /**
   * Delete a transaction
   */
  async deleteTransaction(eventId, txId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('transactions').delete().eq('id', txId);
      } catch (err) {
        console.warn('Supabase deleteTransaction error:', err);
      }
    }

    const events = getLocalEvents();
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          transactions: (evt.transactions || []).filter(t => t.id !== txId)
        };
      }
      return evt;
    });
    saveLocalEvents(updated);
  },

  /**
   * Reset data to initial demo data
   */
  resetToDemo() {
    saveLocalEvents(INITIAL_DEMO_EVENTS);
    return INITIAL_DEMO_EVENTS;
  },

  /**
   * Seed demo data to Supabase if empty
   */
  async seedSupabaseDemo() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      console.log('Seeding initial demo data into Supabase...');
      // Insert first demo event
      const goa = INITIAL_DEMO_EVENTS[0];
      const { data: createdEvt } = await supabase.from('events').insert({
        title: goa.title,
        description: goa.description,
        category: goa.category,
        currency: goa.currency
      }).select().single();

      if (createdEvt) {
        const idMap = {};
        for (const p of goa.participants) {
          const { data: insertedP } = await supabase.from('participants').insert({
            event_id: createdEvt.id,
            name: p.name,
            upi_id: p.upi_id,
            is_manager: p.is_manager,
            color: p.color
          }).select().single();
          if (insertedP) idMap[p.id] = insertedP.id;
        }

        for (const t of goa.transactions) {
          await supabase.from('transactions').insert({
            event_id: createdEvt.id,
            type: t.type,
            title: t.title,
            category: t.category,
            amount: t.amount,
            quantity: t.quantity,
            paid_by_id: idMap[t.paid_by_id] || Object.values(idMap)[0],
            manager_id: t.manager_id ? idMap[t.manager_id] : null,
            date: t.date,
            notes: t.notes
          });
        }
      }
    } catch (e) {
      console.warn('Seed to Supabase skipped:', e);
    }
  }
};
