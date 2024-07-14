import { useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { CamposPreenchidos, DeepCopy } from "../functions/auxiliar";
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
        GETData({ table: "entrada-estoque" }),
        GETData({ table: "fornecedores" }),
        GETData({ table: "produtos" })
    ])

    return {
        props: {
            entradaEstoque: orderByDate(listData[0]),
            fornecedores: listData[1],
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

    // Ordenar o array pelo campo datEnt (data de entrada) da mais recente para a mais antiga
    list.sort((a, b) => {
        // Converter as datas para um formato comparável (yyyy/mm/dd)
        let dataA = converterDataFormato(a.datEnt)
        let dataB = converterDataFormato(b.datEnt)
        
        // Comparar as datas convertidas
        if (dataA < dataB) return 1 // se a data de A for menor, retorna 1 (para ordenar de forma decrescente)
        else if (dataA > dataB) return -1 // se a data de A for maior, retorna -1 (para ordenar de forma decrescente)
        else return 0 // se forem iguais, retorna 0
    })

    return list
}

export default function EntradaEstoque({ entradaEstoque, fornecedores, produtos }) {
    const date = new Date().toLocaleDateString()
    const [load, setLoad] = useState(false)
    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })

    const [rows, setRows] = useState(entradaEstoque)
    const [listaProdutos, setListaProdutos] = useState(produtos)

    const [openModal, setOpenModal] = useState(false) // Abre e fecha o modal
    const [formData, setFormData] = useState({
        codFor: { value: null, inputValue: '' }, codPro: { value: null, inputValue: '' },
        codLot: '', datEnt: date.split('/').reverse().join('-'), datVal: '', qtdEnt: 0
    })

    const clearAll = () => {
        setFormData({
            codFor: { value: null, inputValue: '' }, codPro: { value: null, inputValue: '' },
            codLot: '', datEnt: date.split('/').reverse().join('-'), datVal: '', qtdEnt: 0
        })
    }

    async function BuscarDados(isDelete = false) {
        setLoad(true)

        await GETData({ table: "entrada-estoque" })
        .then(async (res) => {
            if(!isDelete && res.length === 0)
                return setSnack({ open: true, txt: 'Voce ainda não possui nenhuma entrada no estoque', color: 'info' })

            setRows(orderByDate(res))
            const produtosAtualizados = await GETData({ table: "produtos" })
            setListaProdutos(produtosAtualizados)
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao buscar os movimentações de entrada', color: 'error' })
        })

        setLoad(false)
    }

    async function CalcularEstoqueProduto(id, qtd, somar = true) {
        await GETSpecificData("produtos", id)
        .then(res => {
            let quantidade;

            if(somar) quantidade = (Number(res.estAtu) + qtd).toString()
            else quantidade = (Number(res.estAtu) - qtd).toString()

            UPDATEData({ id: id, table: "produtos", form: { estAtu: quantidade } })
        })
    }

    async function GravarDados() {
        const id = await GETData({ table: "entrada-estoque" })

        const form = DeepCopy({ ...formData })
        form.codEnt = (id.length + 1).toString()
        form.codFor = form.codFor.value == null ? '' : form.codFor.value.codFor
        form.codPro = form.codPro.value == null ? '' : form.codPro.value.codBar
        form.qtdEnt = parseFloat(form.qtdEnt)
        form.datEnt = form.datEnt.split('-').reverse().join('/')
        form.datVal = form.datVal.split('-').reverse().join('/')

        if(!CamposPreenchidos(form, ["codFor", "codPro", "qtdEnt", "datEnt", "datVal"]))
            return setSnack({ open: true, txt: 'Preencha todos os campos obrigatórios*', color: 'warning' })

        setLoad(true)

        // return console.log({ table: "entrada-estoque", form: form, primaryKey: form.codEnt })

        await POSTData({ table: "entrada-estoque", form: form, primaryKey: form.codEnt, timeStamp: false })
        .then(async (res) => {
            // console.log(res)

            switch(res) {
                case "OK":
                    clearAll()
                    setOpenModal(false)

                    await CalcularEstoqueProduto(form.codPro, form.qtdEnt)
                    BuscarDados()
                    setSnack({ open: true, txt: "Entrada cadastrada com sucesso", color: "success" })
                break;

                case "EXISTE":
                    setSnack({ open: true, txt: "Já existe uma entrada com esse código cadastrado", color: "warning" })
                break;

                default:
                    setSnack({ open: true, txt: "Erro ao cadastrar a entrada", color: "error" })
                break;
            }
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao cadastrar a entrada', color: 'error' })
        })

        setLoad(false)
    }

    return (
        <AdminLayout>
            <Preloader open={load} />
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body
                title="Entrada de estoque"
                description="Faça aqui os movimentos de entrada de estoque"
            >
                {/* <div className="d-flex mb-3" style={{ gap: 16 }}>
                    <InputText
                        // required
                        data={{ value: filter.vlrInput }}
                        onChange={e => filterData(e.target.value)}
                        label={'Pesquisar por ' + (optionsFilter.find(f => f.value == filter.field).label).toLocaleLowerCase()}
                        // mask={}
                    />

                    <SelectOption
                        className="w-50"
                        options={optionsFilter}
                        title={'Pesquisar por: '}
                        value={filter.field || ''}
                        onChange={e => setFilter({ ...filter, field: e.target.value })}
                    />
                </div> */}

                <Table
                    rows={rows}
                    idRow='codEnt'
                    emptyMessage='As entradas de estoque aparecerão aqui'
                    header={[
                        { title: 'Fornecedor', sync: 'codFor', format: e => seeField(fornecedores, 'codFor', e, 'nomFor') },
                        { title: 'Produto', sync: 'codPro', format: e => seeField(listaProdutos, 'codBar', e, 'nomPro') },
                        { title: 'Lote', sync: 'codLot' },
                        { title: 'Entrada', sync: 'datEnt' },
                        { title: 'Quantidade', sync: 'qtdEnt' },
                        { title: 'Validade', sync: 'datVal' },
                    ]}
                    showDeleteButton={async (row) => {
                        if(!confirm('Deseja realmente excluir esse registro?'))
                            return

                        await DELETEData({ table: 'entrada-estoque', primaryKey: row.codEnt })
                        .then(() => {
                            BuscarDados(true)
                            CalcularEstoqueProduto(row.codPro, row.qtdEnt, false)
                            setSnack({ open: true, txt: 'Entrada excluída com sucesso', color: 'success' })
                        })
                        .catch(() => setSnack({ open: true, txt: 'Erro ao excluir a entrada', color: 'error' }))
                    }}
                />

                <Button
                    variant="contained"
                    className="position-absolute"
                    onClick={() => setOpenModal(true)}
                    style={{ bottom: 10, right: 10, left: 10 }}
                >
                    Cadastrar entrada de estoque
                </Button>
            </Body>

            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                    // clearAll()
                }}
            >
                <h3 className="m-0">
                    {/* { edit == null ? 'Cadastrar novo' : 'Editar' } fornecedor */}
                    Cadastrar entrada de estoque
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
                        equalKey={'codFor'}
                        label={'Fornecedor'}
                        labelText={'nomFor'}
                        options={fornecedores}
                        // labelDesc={'desPro'}
                        value={formData.codFor}
                        optionDisabled={fornecedores.filter(f => !f.sitFor).map(l => l.codFor)}
                        onChange={e => setFormData({ ...formData, codFor: { ...formData.codFor, value: e } })}
                        onInputChange={e => setFormData({ ...formData, codFor: { ...formData.codFor, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ codFor, nomFor }) => {
                                return codFor.toUpperCase().match(formData.codFor.inputValue.toUpperCase()) || nomFor.toUpperCase().match(formData.codFor.inputValue.toUpperCase())
                            })
                        }}
                    />

                    <InputText
                        required
                        type='date'
                        label='Data da entrada'
                        data={{ value: formData.datEnt }}
                        onChange={e => setFormData({ ...formData, datEnt: e.target.value })}
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <InputText
                        required
                        type="number"
                        label='Quantidade'
                        data={{ value: formData.qtdEnt }}
                        onChange={e => setFormData({ ...formData, qtdEnt: e.target.value })}
                    />

                    <InputText
                        // required
                        label='Lote'
                        data={{ value: formData.codLot.toUpperCase() }}
                        onChange={e => setFormData({ ...formData, codLot: e.target.value })}
                    />

                    <InputText
                        required
                        type='date'
                        label='Data da validade'
                        data={{ value: formData.datVal }}
                        onChange={e => setFormData({ ...formData, datVal: e.target.value })}
                    />
                </StackPage>

                {
                    formData.codPro.value == null ? null :
                    Number(formData.qtdEnt) + Number(formData.codPro.value.estAtu) <= Number(formData.codPro.value.estMax) ? null : 
                    <p className="m-0 text-danger">
                        {`Quantidade máxima: ${formData.codPro.value.estMax}`}
                    </p>
                }

                <Button
                    color="success"
                    variant="contained"
                    className="w-100 mt-3"
                    onClick={GravarDados}
                    disabled={
                        formData.codPro.value == null ? false : Number(formData.qtdEnt) + Number(formData.codPro.value.estAtu) > Number(formData.codPro.value.estMax) || formData.qtdEnt == 0
                    }
                >
                    Enviar entrada de estoque
                </Button>
            </Modal>
        </AdminLayout>
    )
}