import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Obtener instancia de Firestore (reutilizar si ya existe)
function getFirestoreInstance() {
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
}

export async function GET(request: NextRequest) {
  try {
    const firestore = getFirestoreInstance();
    
    console.log('Fetching users from Firestore...');
    
    // Obtener todos los usuarios (sin orderBy para evitar problemas de índice)
    const usersRef = collection(firestore, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log('Users found:', usersSnapshot.size);
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Obtener deudores de cada usuario
    const debtorsRef = collection(firestore, 'debtors');
    const allDebtorsSnapshot = await getDocs(debtorsRef);
    
    console.log('Debtors found:', allDebtorsSnapshot.size);
    
    const usersWithDebtors = users.map((user: any) => {
      const userDebtors = allDebtorsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((debtor: any) => debtor.ownerUid === user.uid);
      
      const totalDebt = userDebtors.reduce((sum: number, debtor: any) => sum + (debtor.totalDebt || 0), 0);
      
      return {
        ...user,
        debtors: userDebtors,
        totalDebtAmount: totalDebt,
        debtorsCount: userDebtors.length,
      };
    });
    
    // Ordenar por fecha de creación (más reciente primero)
    usersWithDebtors.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    console.log('Processed users:', usersWithDebtors.length);
    
    return NextResponse.json({
      success: true,
      users: usersWithDebtors,
      total: usersWithDebtors.length,
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const firestore = getFirestoreInstance();
    
    console.log('Attempting to delete user:', userId);
    
    // Buscar el documento del usuario por UID
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Eliminar el documento del usuario
    const userDoc = querySnapshot.docs[0];
    await deleteDoc(userDoc.ref);
    
    // Eliminar todos los deudores del usuario
    const debtorsRef = collection(firestore, 'debtors');
    const debtorsQuery = query(debtorsRef, where('ownerUid', '==', userId));
    const debtorsSnapshot = await getDocs(debtorsQuery);
    
    const deletePromises = debtorsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ User deleted successfully:', userId);
    console.log('✅ Deleted', debtorsSnapshot.size, 'debtors');
    
    return NextResponse.json({
      success: true,
      message: 'User and associated debtors deleted successfully',
      deletedDebtors: debtorsSnapshot.size,
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
