// import { v4 as uuidv4 } from 'uuid';
// const { v4: uuidv4 } = require('uuid')
// Database imports
import { db } from "./firebase";
import { collection, getDoc, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

export async function GETData({ table }) {
    let result;

    await getDocs(collection(db, table))
    .then(res => {
        const arr = []
        res.forEach(r => arr.push(r.data()))
        result = arr
    })
    .catch(err => {
        throw new Error(err)
    })

    return result;
}

export const GETSpecificData = async (table, primaryKey) => {
    let result = await getDoc(doc(db, table, primaryKey))

    if(result.exists()) {
        result = result.data()
    } else {
        result = 'CÓDIGO INVÁLIDO'
    }

    return result
}

export async function POSTData({ table, form = {}, primaryKey }) {
    let result = "OK"
    const ifExist = await getDoc(doc(db, table, primaryKey))

    if(ifExist.exists()) {
        result = "EXISTE"
    } else {
        await setDoc(doc(db, table, primaryKey), form)
        .catch(err => {
            throw new Error(err)
        })
    }

    return result;
}

export async function DELETEData({ table, primaryKey }) {
    let result = "OK"

    await deleteDoc(doc(db, table, primaryKey))
    .catch(err => {
        throw new Error(err)
    })

    return result;
}

export async function UPDATEData({ table, id, form }) {
    let result = "OK"
    const instance = doc(db, table, id)

    await updateDoc(instance, form)
    .catch(err => {
        throw new Error(err)
    })

    return result;
}