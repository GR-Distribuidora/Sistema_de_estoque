import currency from "currency.js"

/**
 *
 * @description Essa função verifica a quantidade de caracteres do parâmetro, e retorna o mesmo com a máscara, dependendo da quantidade de caracteres. Se a quantidade não corresponder a 11 ou 14 dígitos, o valor é retornado do jeito que foi enviado.
 */
export function CPFCNPJMask(cdg) {
    if(cdg == null) return ''

    if(cdg.length == 11)
        cdg = cdg.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    else if(cdg.length == 14)
        cdg = cdg.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

    return cdg
}


/**
 *
 * @description Essa função formata o parâmetro para a máscara de RG
 */
export function RGMask(rg) {
    if(rg == null) return ''

    rg = rg.replace(/\D/g,"")
    rg = rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})$/, "$1.$2.$3-$4")
    return rg
}


/**
 *
 * @description Essa função faz a formatação do parâmetro para máscara de telefone
 */
export function TelefoneMask(numTel, removeDDD = false) {
    if(numTel == null)
        return ''

    numTel = numTel.toString()

    if(numTel.length === 10) {
        return numTel.replace(/\D/g, '').replace(/(\d{2})(\d{4})(\d{4})/, '($1)$2-$3')
    } else {
        if(!removeDDD)
            numTel = numTel.replace(/^(\d{2})(\d)/g, "($1)$2 ") // Coloca parênteses em volta dos dois primeiros dígitos

        numTel = numTel.replace(/(\d)(\d{4})$/, "$1-$2") // Coloca hífen entre o quarto e o quinto dígitos
        return numTel
    }
}


/**
 *
 * @description Essa função faz a formatação do parâmetro para máscara de cep
 */
export function CEPCodeMask(value) {
    const mask = /^([\d]{2})\.*([\d]{3})-*([\d]{3})/

    if (!value) return ''
    else if(!mask.test(value)) return value

    value = value.replace(mask, "$1.$2-$3")
    return value
}


/**
 *
 * @description Essa função faz a formatação do parâmetro para máscara de dinheiro, ou trunca o valor
 */
export function CurrencyMask(vlr = '', operation = '', symbol = 'R$') {
    const fixValue = value => currency(value, { symbol: symbol, separator: '.', decimal: ',' })

    if(vlr === '')
        return vlr
    else if(operation == 'format')
        return fixValue(parseFloat(vlr)).format()
    else(operation == 'truncate')
        return fixValue(vlr).value
}


/**
 *
 * @description Essa função transforma a primeira letra da string em maiúscula
 */
export function UpperCaseFirstLetter(str) {
    if(str == undefined) return str

    return str.charAt(0).toUpperCase() + str.slice(1)
}