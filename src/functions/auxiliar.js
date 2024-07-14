/**
 * 
 * @description Essa função verifica se os campos requeridos foram preenchidos no objeto. Se não houver segundo parâmetro, todos os campos são considerados obrigatórios
 */
export function CamposPreenchidos(obj, requiredFields) {
    let flag = true
    const fields = Object.keys(obj)
    const required = requiredFields || fields

    for(let i = 0; i < required.length; i++)
        if(obj[required[i]] == '') {
            flag = false
            break
        }

    return flag
}

/**
 *
 * @description Essa função formata o objeto passado por parâmetro para o modelo do select option
 */
export function FormatarLabelSelect(arr) {
    return Object.keys(arr).map(t => { return { value: t, label: arr[t] } })
}


/**
 *
 * @description Essa função faz o replace de uma string com base nos caracteres passados no segundo parâmetro (array)
 */
export function ReplaceList(value, list) {
    list.forEach(l => value = value.replaceAll(l, ''))
	return value
}


/**
 *
 * @description Essa função faz a ordenação de um array com base no campo especificado
 */
export function OrderBy(array, campo) {
    if(array.length === 0) return []
    return array.sort((a, b) => a[campo] - b[campo])
}


/**
 *
 * @description Essa função retorna a cópia do objeto/array passado por parâmetro sem afetar o de origem
 */
export function DeepCopy(objeto) {
    return JSON.parse(JSON.stringify(objeto))
}


/**
 *
 * @description Essa função retorna um novo objeto somente com os dados que foram atualizados, para efetuar o PATCH no endpoint
 */
export function ObjectPatch(formBase, formAtualizado) {
    let auxForm = {}
    const keys = Object.keys(formBase)

    for(let i = 0; i < keys.length; i++)
        if(typeof formBase[keys[i]] != 'object' && formBase[keys[i]] != formAtualizado[keys[i]])
            auxForm[keys[i]] = formAtualizado[keys[i]]

    formAtualizado = auxForm
    return auxForm
}


/**
 *
 * @description Essa função valida se o usuário pode ou não acessar a tela atual
 */
export function CheckAccess(menu, url) {
    return menu.findIndex(m => m.link == url) != -1
}


/**
 *
 * @description Essa função retorna uma data timestamp se a flag for true, e converte o timestamp se a flag for false
 */
export function ConvertTimestamp(date, flag = true) {
    if(flag) {
        let parts = date.match(/(\d+)/g)
        let dateObject = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5])

        // Obter o timestamp em milissegundos
        return dateObject.getTime()
    } else {
        return new Date(date).toLocaleString()
    }
}