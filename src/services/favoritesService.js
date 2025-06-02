import { collection, addDoc, deleteDoc, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const addToFavorites = async (userId, book) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId), where('bookId', '==', book.id));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(favoritesRef, {
        userId,
        bookId: book.id,
        book: book,
        createdAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, bookId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId), where('bookId', '==', bookId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'favorites', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isBookFavorite = async (userId, bookId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId), where('bookId', '==', bookId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().book);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
}; 