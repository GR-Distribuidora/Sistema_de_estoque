// import { v4 as uuidv4 } from 'uuid';
// const { v4: uuidv4 } = require('uuid')
// Database imports
import { db } from "./firebase";
import { ConvertTimestamp } from "../functions/auxiliar";
import { collection, getDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, Timestamp, query, where } from "firebase/firestore";

export async function GETData({ table }) {
    let result = []

    await getDocs(collection(db, table))
    .then(res => {
        const arr = []
        res.forEach(r => arr.push(r.data()))

        for(let i = 0; i < arr.length; i++) {
            if(arr[i].datCad == undefined)
                break;

            if(!(typeof arr[i].datCad == 'string'))
                arr[i].datCad = ConvertTimestamp(arr[i].datCad.toDate("pt-br"), false).replace(', ', ' | ')
        }

        result = arr
    })
    .catch(err => {
        throw new Error(err)
        
    })

    return result;
}

export const GETSpecificData = async (table, primaryKey) => {
    let result = await getDoc(doc(db, table, primaryKey))

    if (result.exists()) {
        result = result.data()
    } else {
        result = 'CÓDIGO INVÁLIDO'
    }

    return result
}

export async function POSTData({ table, form = {}, primaryKey, timeStamp = true }) {
    let result = "OK"
    const ifExist = await getDoc(doc(db, table, primaryKey))

    if (ifExist.exists()) {
        result = "EXISTE"
    } else {
        if(timeStamp)
            form.datCad = Timestamp.fromDate(new Date())

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

export async function BuscarRegistrosPorMesAno(table, month, year) {
    // Construir as datas de início e fim do período
    const primeiroDia = new Date(year, month - 1, 1) // mês é base 0 no JavaScript
    const ultimoDia = new Date(year, month, 0) // último dia do mês

    // Converter as datas para Timestamps do Firestore
    const primeiroDiaTimestamp = Timestamp.fromDate(primeiroDia)
    const ultimoDiaTimestamp = Timestamp.fromDate(ultimoDia)

    let listResult = []

    const instanceTable = collection(db, table)
    const queryDB = query(instanceTable,
        where("datCad", ">=", primeiroDiaTimestamp),
        where("datCad", "<=", ultimoDiaTimestamp)
    )

    const querySnapshot = await getDocs(queryDB)
    querySnapshot.forEach(doc => listResult.push(doc.data()))

    return listResult;
}

export async function BuscarDadosHoje(table) {
    let listResult = []

    const date = new Date()  // Isso cria um objeto Date com a data e hora atuais no fuso horário padrão do sistema
    const dateFusoHorario = new Date(date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
    const hojeTimestamp = Timestamp.fromDate(dateFusoHorario)

    const instanceTable = collection(db, table)
    const queryDB = query(instanceTable,
        where("datCad", "==", hojeTimestamp)
    )

    const querySnapshot = await getDocs(queryDB)
    querySnapshot.forEach(doc => listResult.push(doc.data()))

    return listResult;
}