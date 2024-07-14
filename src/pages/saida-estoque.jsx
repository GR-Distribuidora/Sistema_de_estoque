import { useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { CurrencyMask } from "../functions/masks";
import { CamposPreenchidos, ConvertTimestamp, DeepCopy } from "../functions/auxiliar";
import { GETData, GETSpecificData, POSTData, UPDATEData, DELETEData } from "../services/functions";
// Componentes
import { Button } from "@mui/material";
import Modal from "../components/Modal";
import Table from "../components/Table";
import Preloader from "../components/Preloader";
import SnackAlert from "../components/SnackAlert";
import { Body, StackPage } from "../components/Card";
import InputText, { AutoComplete } from "../components/Input";

export async function getServerSideProps() {
    const listData = await Promise.all([
        GETData({ table: "saida-estoque" }),
        GETData({ table: "clientes" }),
        GETData({ table: "produtos" })
    ])

    return {
        props: {
            saidaEstoque: orderByDate(listData[0]),
            clientes: listData[1],
            produtos: listData[2]
        }
    }
}

const seeField = (list, fieldKey, value, field) => list.find(p => p[fieldKey] == value) === undefined ? '' : list.find(p => p[fieldKey] == value)[field]

const orderByDate = list => {
    // Função para converter a data do formato dd/mm/yyyy para yyyy/mm/dd
    function converterDataFormato(data) {
        let partes = data.split('/');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    // Ordenar o array pelo campo darCad (data de saída) da mais recente para a mais antiga
    list.sort((a, b) => {
        // Converter as datas para um formato comparável (yyyy/mm/dd)
        let dataA = converterDataFormato(a.datCad.split(' | ')[0])
        let dataB = converterDataFormato(b.datCad.split(' | ')[0])
        
        // Comparar as datas convertidas
        if (dataA < dataB) return 1 // se a data de A for menor, retorna 1 (para ordenar de forma decrescente)
        else if (dataA > dataB) return -1 // se a data de A for maior, retorna -1 (para ordenar de forma decrescente)
        else return 0 // se forem iguais, retorna 0
    })

    return list
}

export default function SaidaEstoque({ saidaEstoque, clientes, produtos }) {
    const [load, setLoad] = useState(false)
    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })

    const [rows, setRows] = useState(saidaEstoque)
    const [listaProdutos, setListaProdutos] = useState(produtos)

    const [openModal, setOpenModal] = useState(false) // Abre e fecha o modal
    const [formData, setFormData] = useState({
        codCli: { value: null, inputValue: '' }, codPro: { value: null, inputValue: '' }, qtdSai: 0,
    })

    const clearAll = () => {
        setFormData({
            codCli: { value: null, inputValue: '' }, codPro: { value: null, inputValue: '' }, qtdSai: 0,
        })
    }

    async function BuscarDados(isDelete = false) {
        setLoad(true)

        await GETData({ table: "saida-estoque" })
        .then(async (res) => {
            if(!isDelete && res.length === 0)
                return setSnack({ open: true, txt: 'Voce ainda não possui nenhuma saída no estoque', color: 'info' })

            setRows(orderByDate(res))
            const produtosAtualizados = await GETData({ table: "produtos" })
            setListaProdutos(produtosAtualizados)
        })
        .catch(err => {
            console.log(err)
            setSnack({ open: true, txt: 'Erro ao buscar os movimentações de saída', color: 'error' })
        })

        setLoad(false)
    }

    async function CalcularEstoqueProduto(id, qtd, subtrair = true) {
        await GETSpecificData("produtos", id)
        .then(res => {
            let quantidade;

            if(subtrair) quantidade = (Number(res.estAtu) - qtd).toString()
            else quantidade = (Number(res.estAtu) + qtd).toString()

            UPDATEData({ id: id, table: "produtos", form: { estAtu: quantidade } })
        })
    }

    async function GravarDados() {
        const id = await GETData({ table: "saida-estoque" })

        const form = DeepCopy({ ...formData })
        form.codSai = (id.length + 1).toString()
        form.codCli = form.codCli.value == null ? '' : form.codCli.value.codCli
        form.codPro = form.codPro.value == null ? '' : form.codPro.value.codBar
        form.qtdSai = parseFloat(form.qtdSai)

        if(!CamposPreenchidos(form, ["codCli", "codPro", "qtdSai"]))
            return setSnack({ open: true, txt: 'Preencha todos os campos obrigatórios*', color: 'warning' })

        // return console.log({ table: "saida-estoque", form: form, primaryKey: form.codSai })
        setLoad(true)

        // return console.log({ table: "entrada-estoque", form: form, primaryKey: form.codEnt })

        await POSTData({ table: "saida-estoque", form: form, primaryKey: form.codSai })
        .then(async (res) => {
            // console.log(res)

            switch(res) {
                case "OK":
                    clearAll()
                    setOpenModal(false)

                    await CalcularEstoqueProduto(form.codPro, form.qtdSai)
                    BuscarDados()
                    setSnack({ open: true, txt: "Saída cadastrada com sucesso", color: "success" })
                break;

                case "EXISTE":
                    setSnack({ open: true, txt: "Já existe uma saída com esse código cadastrado", color: "warning" })
                break;

                default:
                    setSnack({ open: true, txt: "Erro ao cadastrar a saída", color: "error" })
                break;
            }
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao cadastrar a saída', color: 'error' })
        })

        setLoad(false)
    }

    return (
        <AdminLayout>
            <Preloader open={load} />
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body
                title="Saída de estoque"
                description="Faça aqui os movimentos de saída de estoque"
            >
                <Table
                    rows={rows}
                    idRow='codSai'
                    emptyMessage='As saídas de estoque aparecerão aqui'
                    header={[
                        { title: 'Cliente', sync: 'codCli', format: e => seeField(clientes, 'codCli', e, 'nomCli') },
                        { title: 'Produto', sync: 'codPro', format: e => seeField(listaProdutos, 'codBar', e, 'nomPro') },
                        { title: 'Quantidade', sync: 'qtdSai' },
                        { title: 'Valor unitário', sync: 'codPro', format: e => CurrencyMask(seeField(listaProdutos, 'codBar', e, 'preVen'), 'format') },
                        { title: 'Valor total', sync: 'codPro', format: (e, row) => CurrencyMask(seeField(listaProdutos, 'codBar', e, 'preVen') * row.qtdSai, 'format') },
                        { title: 'Saída', sync: 'datCad' },
                    ]}
                    showDeleteButton={async (row) => {
                        if(!confirm('Deseja realmente excluir esse registro?'))
                            return

                        await DELETEData({ table: 'saida-estoque', primaryKey: row.codSai })
                        .then(() => {
                            BuscarDados(true)
                            CalcularEstoqueProduto(row.codPro, row.qtdSai, false)
                            setSnack({ open: true, txt: 'Saída excluída com sucesso', color: 'success' })
                        })
                        .catch(() => setSnack({ open: true, txt: 'Erro ao excluir a saída', color: 'error' }))
                    }}
                />

                <Button
                    variant="contained"
                    className="position-absolute"
                    onClick={() => setOpenModal(true)}
                    style={{ bottom: 10, right: 10, left: 10 }}
                >
                    Cadastrar saída de estoque
                </Button>
            </Body>

            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                    clearAll()
                }}
            >
                <h3 className="m-0">
                    Cadastrar saída de estoque
                </h3>

                <hr className="mt-1" />

                <StackPage>
                    <AutoComplete
                        required
                        label={'Produto'}
                        equalKey={'codBar'}
                        labelText={'nomPro'}
                        labelDesc={'desPro'}
                        options={listaProdutos}
                        value={formData.codPro}
                        optionDisabled={listaProdutos.filter(f => !f.sitPro).map(l => l.codBar)}
                        onChange={e => setFormData({ ...formData, codPro: { ...formData.codPro, value: e } })}
                        onInputChange={e => setFormData({ ...formData, codPro: { ...formData.codPro, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ codBar, nomPro }) => {
                                return codBar.toUpperCase().match(formData.codPro.inputValue.toUpperCase()) || nomPro.toUpperCase().match(formData.codPro.inputValue.toUpperCase())
                            })
                        }}
                    />

                    <AutoComplete
                        required
                        label={'Cliente'}
                        options={clientes}
                        equalKey={'codCli'}
                        labelText={'nomCli'}
                        // labelDesc={'desPro'}
                        value={formData.codCli}
                        onChange={e => setFormData({ ...formData, codCli: { ...formData.codCli, value: e } })}
                        onInputChange={e => setFormData({ ...formData, codCli: { ...formData.codCli, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ codCli, nomCli }) => {
                                return codCli.toUpperCase().match(formData.codCli.inputValue.toUpperCase()) || nomCli.toUpperCase().match(formData.codCli.inputValue.toUpperCase())
                            })
                        }}
                    />

                    <InputText
                        required
                        type='number'
                        label='Quantidade de saída'
                        data={{ value: formData.qtdSai }}
                        onChange={e => setFormData({ ...formData, qtdSai: e.target.value })}
                    />
                </StackPage>

                {
                    formData.codPro.value == null ? null :
                    Number(formData.qtdSai) <= Number(formData.codPro.value.estAtu) ? null : 
                    <p className="m-0 text-danger text-end">
                        {`Quantidade disponível: ${formData.codPro.value.estAtu}`}
                    </p>
                }

                {
                    formData.codPro.value == null ? null :
                    (Number(formData.codPro.value.estAtu) - Number(formData.qtdSai)) < Number(formData.codPro.value.estMin) ?
                        <p className="m-0 text-danger text-end">
                            O estoque deste produto ficará com quantidade menor ou igual a sua quantidade mínima
                        </p>
                    : null
                }

                <Button
                    color="success"
                    variant="contained"
                    onClick={GravarDados}
                    className="w-100 mt-3"
                    disabled={
                        formData.codPro.value == null ? false : Number(formData.qtdSai) > Number(formData.codPro.value.estAtu) || formData.qtdSai == 0
                    }
                >
                    Enviar saída de estoque
                </Button>
            </Modal>
        </AdminLayout>
    )
}
