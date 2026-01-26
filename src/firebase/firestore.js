// src/firebase/firestore.js
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

/**
 * Save a new trip
 */
export const saveTrip = async (userId, tripData) => {
  try {
    const tripRef = await addDoc(collection(db, 'trips'), {
      ownerId: userId,
      tripName: tripData.tripName || `${tripData.city} Trip`,
      destination: tripData.city,
      checkIn: tripData.checkIn,
      checkOut: tripData.checkOut,
      travelers: tripData.travelers,
      budgetPerPerson: tripData.budgetPerPerson,
      style: tripData.style,
      preferences: tripData.preferences,
      selectedOutboundFlight: tripData.selectedOutboundFlight || null,
      selectedReturnFlight: tripData.selectedReturnFlight || null,
      selectedHotel: tripData.selectedHotel || null,
      itinerary: tripData.itinerary || null,
      totalCost: tripData.totalCost || 0,
      totalFlightCost: tripData.totalFlightCost || 0,
      totalHotelCost: tripData.totalHotelCost || 0,
      sharedWith: [],
      isPublic: false,
      status: 'planning',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, tripId: tripRef.id };
  } catch (error) {
    console.error('Error saving trip:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (userId) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('ownerId', '==', userId)
      // Removed orderBy temporarily - will be added back after index is created
      // orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trips = [];
    
    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in JavaScript instead (temporary workaround)
    trips.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime; // Newest first
    });
    
    return { success: true, trips };
  } catch (error) {
    console.error('Error getting trips:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a single trip by ID
 */
export const getTrip = async (tripId) => {
  try {
    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        trip: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      return { success: false, error: 'Trip not found' };
    }
  } catch (error) {
    console.error('Error getting trip:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a trip
 */
export const updateTrip = async (tripId, updates) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, 'trips', tripId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get trips shared with user
 */
export const getSharedTrips = async (userId) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('sharedWith', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const trips = [];
    
    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, trips };
  } catch (error) {
    console.error('Error getting shared trips:', error);
    return { success: false, error: error.message };
  }
};