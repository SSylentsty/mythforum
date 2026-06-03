export interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
}

const XP_RULES: Record<string, number> = {
  CREATE_THREAD: 10,
  ADD_COMMENT: 2,
  RECEIVED_UPVOTE: 5,
  MARKED_SOLUTION: 20
};

const DAILY_LIMIT = 200;

// Firestore REST API helper
async function firestoreGet(projectId: string, path: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function firestorePatch(projectId: string, path: string, fields: Record<string, any>, updateMask: string[]) {
  const maskParams = updateMask.map(f => `updateMask.fieldPaths=${f}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?${maskParams}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  return res.ok;
}

async function firestoreCreate(projectId: string, collectionPath: string, fields: Record<string, any>) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  return res.ok;
}

function parseIntegerField(doc: any, fieldName: string): number {
  const field = doc?.fields?.[fieldName];
  if (!field) return 0;
  return parseInt(field.integerValue || '0', 10);
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const projectId = env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Server misconfigured: missing FIREBASE_PROJECT_ID' }), { status: 500 });
  }

  try {
    // 1. Auth: decode JWT to get userId (simplified — production should verify signature)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const userId = decodedPayload.user_id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const { action, targetId } = body;

    if (!XP_RULES[action]) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    const baseAmount = XP_RULES[action];

    // 3. Get current user data from Firestore
    const userDoc = await firestoreGet(projectId, `users/${userId}`);
    
    const currentXp = parseIntegerField(userDoc, 'xp');
    const dailyXpEarned = parseIntegerField(userDoc, 'dailyXpEarned');
    const lastXpReset = parseIntegerField(userDoc, 'lastXpReset');
    const shadowBanned = userDoc?.fields?.shadowBanned?.booleanValue === true;

    // 4. Check if banned
    if (shadowBanned) {
      return new Response(JSON.stringify({ error: 'Account restricted' }), { status: 403 });
    }

    // 5. Daily limit check — reset if 24h passed
    const now = Date.now();
    let effectiveDailyXp = dailyXpEarned;
    let newLastReset = lastXpReset;

    if (now - lastXpReset > 86400000) { // 24 hours
      effectiveDailyXp = 0;
      newLastReset = now;
    }

    if (effectiveDailyXp + baseAmount > DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: 'Daily XP limit reached', 
        dailyXpEarned: effectiveDailyXp,
        limit: DAILY_LIMIT 
      }), { status: 429 });
    }

    // 6. Calculate final XP
    const newXp = currentXp + baseAmount;
    const newDailyXp = effectiveDailyXp + baseAmount;

    // 7. Write updated user data to Firestore
    const updateSuccess = await firestorePatch(projectId, `users/${userId}`, {
      xp: { integerValue: String(newXp) },
      dailyXpEarned: { integerValue: String(newDailyXp) },
      lastXpReset: { integerValue: String(newLastReset) }
    }, ['xp', 'dailyXpEarned', 'lastXpReset']);

    if (!updateSuccess) {
      return new Response(JSON.stringify({ error: 'Failed to update user XP' }), { status: 500 });
    }

    // 8. Write XP log
    await firestoreCreate(projectId, 'xp_logs', {
      userId: { stringValue: userId },
      action: { stringValue: action },
      amount: { integerValue: String(baseAmount) },
      targetId: { stringValue: targetId || '' },
      timestamp: { integerValue: String(now) }
    });

    // 9. Card drop chance (10% on CREATE_THREAD, 3% on ADD_COMMENT)
    let cardDropped = false;
    const dropChance = action === 'CREATE_THREAD' ? 0.10 : action === 'ADD_COMMENT' ? 0.03 : 0;
    
    if (dropChance > 0 && Math.random() < dropChance) {
      cardDropped = true;
      // Pick a random card ID (c1-c7 from our predefined set)
      const cardIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
      const randomCardId = cardIds[Math.floor(Math.random() * cardIds.length)];
      
      await firestoreCreate(projectId, 'user_cards', {
        userId: { stringValue: userId },
        cardId: { stringValue: randomCardId },
        quantity: { integerValue: '1' },
        acquiredAt: { integerValue: String(now) }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      xpGranted: baseAmount,
      newTotalXp: newXp,
      cardDropped
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
