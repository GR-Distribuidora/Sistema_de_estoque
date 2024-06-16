import { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { CamposPreenchidos } from "../functions/auxiliar";
import { GETData, POSTData, UPDATEData, DELETEData } from "../services/functions";
// Componentes
import { Button } from "@mui/material";
import Modal from "../components/Modal";
import Table from "../components/Table";
import Preloader from "../components/Preloader";
import SnackAlert from '../components/SnackAlert';
import { CurrencyMask } from "../functions/masks";
import { Body, StackPage } from "../components/Card";
import InputText, { AutoComplete, MoneyMask, SelectOption } from "../components/Input";

export async function getServerSideProps() {
    const listData = await Promise.all([
        await GETData({ table: "produtos" }),
        await GETData({ table: "fornecedores" }),
    ])

    return {
        props: {
            produtos: listData[0].reverse(),
            fornecedores: listData[1]
        }
    }
}

const findField = (list, key, id, field) => list.find(f => f[key] == id) === undefined ? '' : list.find(f => f[key] == id)[field]
const optionsFilter = [
    { value: 'codBar', label: 'Código de barras' },
    { value: 'nomPro', label: 'Nome do produto' },
    { value: 'desPro', label: 'Descrição do produto' },
]

export default function Produtos({ produtos, fornecedores }) {
    const [load, setLoad] = useState(false)
    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })
    const [openModal, setOpenModal] = useState(false) // Abre e fecha o modal

    const [rows, setRows] = useState(produtos)
    const [filter, setFilter] = useState({
        vlrInput: '', field: 'codBar'
    })

    const [edit, setEdit] = useState(null)
    const [details, setDetails] = useState({})
    const [formData, setFormData] = useState({
        codBar: '', nomPro: '', desPro: '', estAtu: 0, estMax: 0, estMin: 0, sitPro: true, datCad: '',
        preVen: { mask: '0,00', original: 0 }, vlrCus: { mask: '0,00', original: 0 }, codFor: { value: null, inputValue: '' }
    })

    useEffect(() => {
        if(edit != null) {
            let fornecedor = { value: null, inputValue: '' }
            const find = fornecedores.find(f => f.codFor == edit.codFor)

            if(edit.codFor != '' && find != undefined)
                fornecedor = { value: find, inputValue: find.nomFor }

            setFormData({
                codBar: edit.codBar, nomPro: edit.nomPro, desPro: edit.desPro, estAtu: edit.estAtu, estMax: edit.estMax, datCad: edit.datCad,
                estMin: edit.estMin, sitPro: edit.sitPro, preVen: { mask: CurrencyMask(edit.preVen, 'format'), original: edit.preVen },
                vlrCus: { mask: CurrencyMask(edit.vlrCus, 'format'), original: edit.vlrCus }, codFor: fornecedor
            })

            setOpenModal(true)
        }
    }, [edit])

    const clearAll = () => {
        setEdit(null)
        setFormData({
            codBar: '', nomPro: '', desPro: '', estAtu: 0, estMax: 0, estMin: 0, sitPro: true, datCad: '',
            preVen: { mask: '0,00', original: 0 }, vlrCus: { mask: '0,00', original: 0 }, codFor: ''
        })
    }

    const filterData = value => {
        setFilter({ ...filter, vlrInput: value })
        const filtered = produtos.filter(r => r[filter.field] != null && r[filter.field].toString().toUpperCase().match(value.toUpperCase()))
        setRows(filtered)
    }

    async function BuscarDados(isDelete = false) {
        setLoad(true)

        await GETData({ table: "produtos" })
        .then(res => {
            if(!isDelete && res.length === 0)
                return setSnack({ open: true, txt: 'Voce ainda não possui nenhum produto cadastrado', color: 'info' })

            setRows(res.reverse())
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao buscar os produtos', color: 'error' })
        })
    
        setLoad(false)
    }

    async function GravarDados() {
        const form = { ...formData }
        form.preVen = form.preVen.original
        form.vlrCus = form.vlrCus.original
        form.datCad = new Date().toLocaleString()
        form.codFor = form.codFor.value == null ? '' : form.codFor.value.codFor

        if(!CamposPreenchidos(form, ["codBar", "nomPro", "estMin", "estMax"]))
            return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

        setLoad(true)

        await POSTData({ table: "produtos", form: form, primaryKey: form.codBar })
        .then(res => {
            // console.log(res)

            switch(res) {
                case "OK":
                    clearAll()
                    BuscarDados()
                    setOpenModal(false)
                    setSnack({ open: true, txt: "Produto cadastrado com sucesso", color: "success" })
                break;

                case "EXISTE":
                    setSnack({ open: true, txt: "Já existe um produto com esse código de barras cadastrado", color: "warning" })
                break;

                default:
                    setSnack({ open: true, txt: "Erro ao cadastrar o produto", color: "error" })
                break;
            }
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao cadastrar produto', color: 'error' })
        })

        setLoad(false)
    }

    return (
        <AdminLayout>
            <Preloader open={load} />
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body
                title="Produtos"
                description="Faça aqui os cadastros dos seus produtos"
            >
                <div className="d-flex mb-3" style={{ gap: 16 }}>
                    <InputText
                        // required
                        data={{ value: filter.vlrInput }}
                        onChange={e => filterData(e.target.value)}
                        label={'Pesquisar por ' + (optionsFilter.find(f => f.value == filter.field).label).toLocaleLowerCase()}
                    />

                    <SelectOption
                        className="w-50"
                        options={optionsFilter}
                        title={'Pesquisar por: '}
                        value={filter.field || ''}
                        onChange={e => setFilter({ ...filter, field: e.target.value })}
                    />
                </div>

                <Table
                    rows={rows}
                    idRow='codBar'
                    emptyMessage='Os produtos aparecerão aqui'
                    header={[
                        { title: 'Situação', sync: 'sitPro', align: 'center', format: e => e ? '🟢' : '🔴' },
                        { title: 'Código de barras', sync: 'codBar' },
                        { title: 'Nome', sync: 'nomPro' },
                        { title: 'Descrição', sync: 'desPro' },
                        { title: 'Fornecedor', sync: 'codFor', format: id => findField(fornecedores, 'codFor', id, 'nomFor') },
                        { title: 'Data/Hora do cadastro', sync: 'datCad', format: e => e.replace(', ', ' | ') },
                    ]}
                    showCustomButton={(row, id) => setDetails(row)}
                    showDeleteButton={async (id) => {
                        if(!confirm('Deseja realmente excluir esse registro?'))
                            return

                        await DELETEData({ table: 'produtos', primaryKey: id })
                        .then(() => {
                            BuscarDados(true)
                            setSnack({ open: true, txt: 'Produto excluído com sucesso', color: 'success' })
                        })
                        .catch(() => setSnack({ open: true, txt: 'Erro ao excluir o produto', color: 'error' }))
                    }}
                    showEditButton={row => setEdit(row)}
                />

                <Button
                    // color="success"
                    variant="contained"
                    className="position-absolute"
                    onClick={() => setOpenModal(true)}
                    style={{ bottom: 10, right: 10, left: 10 }}
                >
                    Cadastrar produto
                </Button>
            </Body>

            {/* Cadastrar produto */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                    clearAll()
                }}
            >
                <h3 className="m-0">
                    Cadastrar novo produto
                </h3>

                <hr className="mt-1" />

                <StackPage>
                    <InputText
                        required
                        idFocus="codBar"
                        label='Código de barras'
                        disabled={edit !== null}
                        data={{ value: formData.codBar }}
                        onChange={e => setFormData({ ...formData, codBar: e.target.value })}
                    />

                    <InputText
                        required
                        label='Nome'
                        data={{ value: formData.nomPro }}
                        onChange={e => setFormData({ ...formData, nomPro: e.target.value })}
                    />

                    <InputText
                        // required
                        label='Descrição'
                        data={{ value: formData.desPro }}
                        onChange={e => setFormData({ ...formData, desPro: e.target.value })}
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <InputText
                        required
                        type='number'
                        label='Estoque mínimo'
                        data={{ value: formData.estMin }}
                        onChange={e => setFormData({ ...formData, estMin: e.target.value })}
                    />

                    <InputText
                        required
                        type='number'
                        label='Estoque máximo'
                        data={{ value: formData.estMax }}
                        onChange={e => setFormData({ ...formData, estMax: e.target.value })}
                    />

                    <InputText
                        // required
                        type='number'
                        label='Estoque atual'
                        data={{ value: formData.estAtu }}
                        onChange={e => setFormData({ ...formData, estAtu: e.target.value })}
                    />

                    <SelectOption
                        title={'Situação do produto'}
                        value={formData.sitPro.toString() || ''}
                        onChange={e => setFormData({ ...formData, sitPro: e.target.value })}
                        options={[{ value: true, label: '🟢 Ativo' }, { value: false, label: '🔴 Inativo' }]}
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <MoneyMask
                        // required
                        label='Preço de venda'
                        value={{ valor: formData.preVen }}
                        adornment={{ position: 'start', symbol: 'R$' }}
                        onChange={(mask, original) => setFormData({ ...formData, preVen: { mask: mask, original: original.toString() } })}
                    />

                    <MoneyMask
                        // required
                        label='Valor do custo'
                        value={{ valor: formData.vlrCus }}
                        adornment={{ position: 'start', symbol: 'R$' }}
                        onChange={(mask, original) => setFormData({ ...formData, vlrCus: { mask: mask, original: original.toString() } })}
                    />

                    <AutoComplete
                        equalKey={'codFor'}
                        labelText={'nomFor'}
                        label={'Fornecedor'}
                        options={fornecedores}
                        value={formData.codFor}
                        optionDisabled={fornecedores.filter(f => !f.sitFor).map(l => l.codFor)}
                        onChange={e => setFormData({ ...formData, codFor: { ...formData.codFor, value: e } })}
                        onInputChange={e => setFormData({ ...formData, codFor: { ...formData.codFor, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ codFor, nomFor }) => {
                                return codFor == formData.codFor.inputValue || nomFor.toUpperCase().match(formData.codFor.inputValue.toUpperCase())
                            })
                        }}
                    />
                </StackPage>

                <Button
                    color="success"
                    variant="contained"
                    className="w-100 mt-3"
                    onClick={async () => {
                        if(edit === null) {
                            GravarDados()
                        } else {
                            const form = { ...formData }
                            form.preVen = formData.preVen.original
                            form.vlrCus = formData.vlrCus.original
                            form.codFor = form.codFor.value == null ? '' : form.codFor.value.codFor

                            if(!CamposPreenchidos(form, ["codBar", "nomPro", "estMin", "estMax"]))
                                return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

                            await UPDATEData({ table: "produtos", id: edit.codBar, form: form })
                            .then(res => {
                                BuscarDados()

                                const indice = produtos.findIndex(p => p.codBar === edit.codBar)
                                produtos[indice] = form

                                setSnack({ open: true, txt: "Sucesso ao atualizar o produto", color: "success" })
                            })
                            .catch(err => setSnack({ open: true, txt: "Erro ao atualizar o produto", color: "error" }))

                            setOpenModal(false)
                        }
                    }}
                >
                    { edit === null ? "Enviar " : "Atualizar " } cadastro
                </Button>
            </Modal>

            {/* Detalhes do produto */}
            <Modal  
                // maxWidth="sm"
                onClose={() => setDetails({})}
                open={Object.keys(details).length > 0}
            >
                <header className="text-center">
                    <h3 className="m-0">
                        { details.nomPro }
                    </h3>

                    <p className="m-0">
                        { details.desPro }
                    </p>
                </header>

                <hr className="mt-1" />

                <main>
                    <div className="d-flex flex-md-row flex-column text-center justify-content-between">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Código:</span> { details.codBar }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Situação:</span> { details.sitPro ? "Ativo" : "Inativo" }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Fornecedor:</span> { details.codFor }
                        </p>
                    </div>

                    <div className="d-flex flex-md-row flex-column text-center justify-content-between mt-2">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Estoque mínimo:</span> { details.estMin }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Estoque atual:</span> { details.estAtu }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Estoque máximo:</span> { details.estMax }
                        </p>
                    </div>

                    <div className="d-flex flex-md-row flex-column text-center justify-content-between mt-2">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Valor do custo:</span> { CurrencyMask(details.vlrCus, 'format') }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Preço de venda:</span> { CurrencyMask(details.preVen, 'format') }
                        </p>
                    </div>

                    <p className="m-0 mt-3 text-center" style={{ fontSize: 14 }}>
                        <span className="fw-bold">Data/Hora do cadastro:</span> { details.datCad }
                    </p>
                </main>
            </Modal>
        </AdminLayout>
    )
}