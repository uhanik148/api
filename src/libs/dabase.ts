// src/libs/tourism.ts
import { db } from './firebase';
import firebase from 'firebase/compat/app';

const tourismCollection = db.collection('database');

export const createTourism = async (data: { name: string; description: string; location: string; price: number }) => {
  try {
    const { name, description, location, price } = data;

    const newTourism = {
      name,
      description,
      location,
      price,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await tourismCollection.add(newTourism);
    return { id: docRef.id, ...newTourism };
  } catch (error) {
    throw new Error('Error creating tourism entry: ' + error);
  }
};

export const getTourism = async () => {
  try {
    const snapshot = await tourismCollection.get();
    return snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Error fetching tourism entries: ' + error);
  }
};

export const updateTourism = async (id: string, data: { name: string; description: string; location: string; price: number }) => {
  try {
    const { name, description, location, price } = data;

    const tourismDoc = tourismCollection.doc(id);
    const doc = await tourismDoc.get();

    if (!doc.exists) {
      throw new Error('Tourism entry not found');
    }

    await tourismDoc.update({
      name,
      description,
      location,
      price,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return { id, name, description, location, price };
  } catch (error) {
    throw new Error('Error updating tourism entry: ' + error);
  }
};

export const deleteTourism = async (id: string) => {
  try {
    const tourismDoc = tourismCollection.doc(id);
    const doc = await tourismDoc.get();

    if (!doc.exists) {
      throw new Error('Tourism entry not found');
    }

    await tourismDoc.delete();
    return { message: 'Tourism entry deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting tourism entry: ' + error);
  }
};
