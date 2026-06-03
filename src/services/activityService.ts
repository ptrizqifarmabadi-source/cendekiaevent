import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Activity, OperationType } from '../types';

// Error handler as requested in Firebase integration instructions
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'activities';

export const activityService = {
  subscribeToActivities: (callback: (activities: Activity[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('date', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      callback(activities);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    });
  },

  addActivity: async (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'status'>) => {
    const path = COLLECTION_NAME;
    const isGuest = !auth.currentUser;
    try {
      await addDoc(collection(db, path), {
        ...activity,
        status: isGuest ? 'pending' : 'approved',
        ownerId: auth.currentUser?.uid || 'guest',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateActivity: async (id: string, activity: Partial<Activity>) => {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...activity,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteActivity: async (id: string) => {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
