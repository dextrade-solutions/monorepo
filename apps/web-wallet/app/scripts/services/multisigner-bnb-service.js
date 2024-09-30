import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
  deleteDoc,
} from 'firebase/firestore/lite';
import BaseService from './base';

const setup = () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyBb-730MN2yHlxHEdW4uJre-nxmkGLOCxo',
    authDomain: 'test-project-ddbfe.firebaseapp.com',
    projectId: 'test-project-ddbfe',
    storageBucket: 'test-project-ddbfe.appspot.com',
    messagingSenderId: '578239592667',
    appId: '1:578239592667:web:e59e4e4efa8c9118d974fe',
    measurementId: 'G-VDNM28YYS6',
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const getCollection = () => collection(db, 'multisig');
  const getDocRef = (id) => doc(db, 'multisig', id);

  const postInit = async (data) => {
    const docRef = await addDoc(getCollection(), { ...data });
    await updateDoc(docRef, { ...data, id: docRef.id });
    return docRef.id;
  };

  const getInitialMultisigns = async (address) => {
    if (!address) {
      throw new Error('Initiator address must be not null');
    }
    const q = query(
      getCollection(),
      where('initiatorAddress', '==', address),
      where('status', '==', 'INIT'),
    );
    const querySnapshot = await getDocs(q);
    const arr = [];
    querySnapshot.forEach((d) => arr.push({ ...d.data(), id: d.id }));
    return arr;
  };

  const updateMultisign = async (id, data) => {
    if (!id) {
      throw new Error('ID must be not null');
    }
    return updateDoc(getDocRef(id), { ...data });
  };

  const getUserMultisigns = async (address) => {
    if (!address) {
      throw new Error('Wallet address must be not null');
    }
    const q = query(
      getCollection(),
      where('pubkeys', 'array-contains', address),
    );
    const querySnapshot = await getDocs(q);
    const arr = [];
    querySnapshot.forEach((d) => arr.push({ ...d.data(), id: d.id }));
    return arr;
  };

  const clean = async () => {
    const querySnapshot = await getDocs(getCollection());
    const arr = [];
    querySnapshot.forEach((d) => arr.push(deleteDoc(getDocRef(d.id))));
    return arr.length;
  };

  const getById = async (id) => {
    if (!id) {
      throw new Error('ID must be not null');
    }
    const snap = await getDoc(getDocRef(id));
    if (!snap.exists()) {
      throw new Error('No such document!');
    }
    return snap.data();
  };

  const getTransactionById = async (id) => {
    if (!id) {
      throw new Error('ID must be not null');
    }
    const data = await getDocs(getCollection());
    const trs = data.docs.reduce((acc, d) => {
      const { transactions } = d.data();
      if (transactions) {
        acc = [...acc, ...transactions];
      }
      return acc;
    }, []);
    return trs.find((t) => t.id === id) || null;
  };

  const updateTransactionsById = async (id, data) => {
    if (!id) {
      throw new Error('ID must be not null');
    }
    const ms = await getById(data.multisigId);
    if (!ms) {
      throw new Error(`Multisig with ID:${data.multisigId} not found!`);
    }
    const newTransactions = (ms.transactions || []).map((trx) => {
      if (trx.id !== id) {
        return trx;
      }
      return {
        ...trx,
        ...data,
      };
    });
    return updateDoc(getDocRef(ms.id), {
      ...ms,
      transactions: newTransactions,
    });
  };

  const remove = async (id) => {
    if (!id) {
      throw new Error('ID must be not null');
    }
    return deleteDoc(getDocRef(id));
  };

  return {
    postInit,
    getInitialMultisigns,
    updateMultisign,
    getUserMultisigns,
    clean,
    getById,
    getTransactionById,
    updateTransactionsById,
    remove,
  };
};

class MultisignerBNBServiceApi extends BaseService {
  firebase;

  constructor({ getMnemonicHash }) {
    super({
      apiBaseUrl: '',
      getApiKey: getMnemonicHash,
      authHeader: 'mnemonicHash',
    });
    this.getMnemonicHash = getMnemonicHash;
    this.firebase = setup();
  }

  async clean() {
    return this.firebase.clean();
  }

  async init(data) {
    return this.firebase.postInit(data);
  }

  async getInitialMultisigns(address) {
    return this.firebase.getInitialMultisigns(address);
  }

  async updateMultisign(id, data) {
    return this.firebase.updateMultisign(id, data);
  }

  async getUserMultisigns(address = '') {
    return this.firebase.getUserMultisigns(address);
  }

  async getById(id) {
    return this.firebase.getById(id);
  }

  async getTransactionById(id) {
    return this.firebase.getTransactionById(id);
  }

  async updateTransactionsById(id, data) {
    return this.firebase.updateTransactionsById(id, data);
  }

  async remove(id) {
    return this.firebase.remove(id);
  }

  /**
   * Add signature
   *
   * @param payloads
   * @param payloads.id - id of address
   * @param payloads.pubKey - signature
   * @returns
   */
  addressAddSign(payloads) {
    return this.request('POST', 'address/sign/add', payloads);
  }
}

export default MultisignerBNBServiceApi;
