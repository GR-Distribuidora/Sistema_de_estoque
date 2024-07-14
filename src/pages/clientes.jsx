import axios from "axios";
import { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { CamposPreenchidos, DeepCopy, ReplaceList } from "../functions/auxiliar";
import { CEPCodeMask, CPFCNPJMask, TelefoneMask } from "../functions/masks";
import { GETData, POSTData, UPDATEData, DELETEData } from "../services/functions";
// Componentes
import { Button } from "@mui/material";
import Modal from "../components/Modal";
import Table from "../components/Table";
import Preloader from "../components/Preloader";
import SnackAlert from '../components/SnackAlert';
import { Body, StackPage } from "../components/Card";
import InputText, { AutoComplete, SelectOption } from "../components/Input";

export async function getServerSideProps() {
    const listData = await Promise.all([
        GETData({ table: "clientes" }),
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/?orderBy=nome')
    ])

    return {
        props: {
            clientes: listData[0].reverse(),
            estados: listData[1].data
        }
    }
}

const findField = (list, key, id, field) => list.find(f => f[key] == id) === undefined ? '' : list.find(f => f[key] == id)[field]
const optionsFilter = [
    { value: 'codCli', label: 'Código do cliente' },
    { value: 'nomCli', label: 'Nome' },
    // { value: 'cnpCpf', label: 'CPF/CNPJ' },
    // { value: 'telCli', label: 'Telefone' },
    { value: 'emaCli', label: 'E-mail' },
]

export default function Clientes({ clientes, estados }) {
    const [load, setLoad] = useState(false)
    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })
    const [openModal, setOpenModal] = useState(false) // Abre e fecha o modal

    const [cidades, setCidades] = useState([])
    const [rows, setRows] = useState(clientes)
    const [filter, setFilter] = useState({ vlrInput: '', field: 'codCli' })

    const [edit, setEdit] = useState(null)
    const [details, setDetails] = useState({})
    const [formData, setFormData] = useState({
        nomCli: '', telCli: '', cnpCpf: '', emaCli: '', cepCli: '', baiCli: '', cmpCli: '', endCli: '', 
        cidCli: { value: null, inputValue: '' }, uniFed: { value: null, inputValue: '' }
    })

    useEffect(() => {
        async function LoadEdit() {
            let estado = { value: null, inputValue: '' }
            let cidade = { value: null, inputValue: '' }

            const findEst = estados.find(f => f.sigla == edit.uniFed)
            const findCid = await getCityInfo(edit.cidCli)

            if(edit.uniFed != '' && findEst != undefined)
                estado = { value: findEst, inputValue: findEst.nome }

            if(edit.cidCli != '' && findCid != undefined)
                cidade = { value: findCid, inputValue: findCid.nome }

            await getCities(edit.uniFed)

            setFormData({
                nomCli: edit.nomCli, telCli: TelefoneMask(edit.telCli), cnpCpf: CPFCNPJMask(edit.cnpCpf), emaCli: edit.emaCli,
                cepCli: CEPCodeMask(edit.cepCli), baiCli: edit.baiCli, cmpCli: edit.cmpCli, endCli: edit.endCli,
                cidCli: cidade, uniFed: estado
            })

            setOpenModal(true)
        }

        if(edit != null)
            LoadEdit()
    }, [edit])

    const clearAll = () => {
        setEdit(null)
        setFormData({
            nomCli: '', telCli: '', cnpCpf: '', emaCli: '', cepCli: '', baiCli: '', cmpCli: '',  endCli: '', 
            cidCli: { value: null, inputValue: '' }, uniFed: { value: null, inputValue: '' }
        })
    }

    const getAddress = async (cep) => { // Retorna os dados do endereço a partir do CEP passado por parâmetro
        if(cep === '')
            return

        await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        .then(async (res) => {
            if(!res.data.erro) {
                const cidadesLista = await getCities(res.data.uf)

                const uf = estados.find(e => e.sigla === res.data.uf)
                const cidade = cidadesLista.find(e => e.id === Number(res.data.ibge))

                setFormData({
                    ...formData,
                    baiCli: res.data.bairro,
                    cmpCli: res.data.complemento,
                    endCli: res.data.logradouro,
                    uniFed: { value: uf, inputValue: uf.nome },
                    cidCli: { value: cidade, inputValue: cidade.nome },
                })
            } else {
                setSnack({ open: true, txt: 'CEP não encontrado ou inválido', color: 'error' })
            }
        })
    }

    const getCities = async (uf) => {
        let ret = []

        await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(res => {
            ret = res.data
            setCidades(res.data)
        })

        return ret
    }

    const getCityInfo = async (id) => {
        let ret

        await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${id}`)
        .then(res => ret = res.data)

        return ret
    }

    const filterData = value => {
        setFilter({ ...filter, vlrInput: value })

        if(((/^[A-Z0-9.@\u00C0-\u00FF\s]*$/).test(value.toUpperCase()))) {
            const filtered = clientes.filter(r => r[filter.field] != null && r[filter.field].toString().toUpperCase().match(value.toString().toUpperCase()))
            setRows(filtered)
        } else {
            setRows(clientes)
        }
    }

    async function BuscarDados(isDelete = false) {
        setLoad(true)

        await GETData({ table: "clientes" })
        .then(res => {
            if(!isDelete && res.length === 0)
                return setSnack({ open: true, txt: 'Voce ainda não possui nenhum cliente cadastrado', color: 'info' })

            setRows(res.reverse())
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao buscar os clientes', color: 'error' })
        })

        setLoad(false)
    }

    async function GravarDados() {
        const id = await GETData({ table: "clientes" })

        const form = DeepCopy({ ...formData })
        form.codCli = (id.length + 1).toString()
        form.telCli = ReplaceList(form.telCli, ["(", ")", "-", " "])
        form.cnpCpf = ReplaceList(form.cnpCpf, [".", "-", "/"])
        form.cepCli = ReplaceList(form.cepCli, [".", "-"])
        form.cidCli = form.cidCli.value == null ? '' : form.cidCli.value.id
        form.uniFed = form.uniFed.value == null ? '' : form.uniFed.value.sigla
        form.datCad = new Date().toLocaleString()

        if(!CamposPreenchidos(form, ["nomCli", "cnpCpf"]))
            return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

        // return console.log(form)

        setLoad(true)

        await POSTData({ table: "clientes", form: form, primaryKey: form.codCli, timeStamp: false })
        .then(res => {
            // console.log(res)

            switch(res) {
                case "OK":
                    clearAll()
                    BuscarDados()
                    setOpenModal(false)
                    setSnack({ open: true, txt: "Cliente cadastrado com sucesso", color: "success" })
                break;

                case "EXISTE":
                    setSnack({ open: true, txt: "Já existe um cliente com esse código cadastrado", color: "warning" })
                break;

                default:
                    setSnack({ open: true, txt: "Erro ao cadastrar o cliente", color: "error" })
                break;
            }
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao cadastrar cliente', color: 'error' })
        })

        setLoad(false)
    }

    return (
        <AdminLayout>
            <Preloader open={load} />
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body
                title="Clientes"
                description="Faça aqui os cadastros dos seus clientes"
            >
                <div className="d-flex mb-3" style={{ gap: 16 }}>
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
                </div>

                <Table
                    rows={rows}
                    idRow='codCli'
                    emptyMessage='Os clientes aparecerão aqui'
                    header={[
                        { title: 'Código', sync: 'codCli' },
                        { title: 'Nome', sync: 'nomCli' },
                        { title: 'CPF/CNPJ', sync: 'cnpCpf', format: e => CPFCNPJMask(e) },
                        { title: 'Telefone', sync: 'telCli', format: e => TelefoneMask(e.toString()) },
                        // { title: 'Fornecedor', sync: 'codFor', format: id => findField(fornecedores, 'codFor', id, 'nomFor') },
                        // { title: 'Data/Hora do cadastro', sync: 'datCad', format: e => e.replace(', ', ' | ') },
                    ]}
                    showDeleteButton={async (id) => {
                        if(!confirm('Deseja realmente excluir esse registro?'))
                            return

                        await DELETEData({ table: 'clientes', primaryKey: id })
                        .then(() => {
                            BuscarDados(true)
                            setSnack({ open: true, txt: 'Cliente excluído com sucesso', color: 'success' })
                        })
                        .catch(() => setSnack({ open: true, txt: 'Erro ao excluir o cliente', color: 'error' }))
                    }}
                    showCustomButton={async (row, id) => {
                        const info = await getCityInfo(row.cidCli)
                        setDetails({ ...row, nomeCidade: info.nome })
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
                    Cadastrar cliente
                </Button>
            </Body>

            {/* Cadastrar cliente */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                    clearAll()
                }}
            >
                <h3 className="m-0">
                    { edit == null ? 'Cadastrar novo' : 'Editar' } cliente
                </h3>

                <hr className="mt-1" />

                <StackPage>
                    <InputText
                        required
                        label='Nome'
                        data={{ value: formData.nomCli }}
                        onChange={e => setFormData({ ...formData, nomCli: e.target.value })}
                    />

                    <InputText
                        required
                        label='CPF/CNPJ'
                        data={{ value: formData.cnpCpf }}
                        onChange={e => {
                            if((/^[\d.\/\-]+$/).test(e.target.value) || e.target.value == '')
                                setFormData({ ...formData, cnpCpf: e.target.value })
                        }}
                        mask={
                            ReplaceList(formData.cnpCpf, ['.', '-', '/']).length >= 11 ?
                            '##.###.###/####-##' : '###.###.###-###'
                        }
                    />

                    <InputText
                        // required
                        label='Telefone'
                        mask="(##)# ####-####"
                        data={{ value: formData.telCli }}
                        onChange={e => setFormData({ ...formData, telCli: e.target.value })}
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <InputText
                        // required
                        // type='number'
                        label='E-mail'
                        data={{ value: formData.emaCli }}
                        onChange={e => setFormData({ ...formData, emaCli: e.target.value })}
                    />

                    <InputText
                        // required
                        // type='number'
                        label='CEP'
                        mask="##.###-###"
                        data={{ value: formData.cepCli }}
                        onChange={e => setFormData({ ...formData, cepCli: e.target.value })}
                        onBlur={() => getAddress(formData.cepCli.replace('.', ''))}
                    />

                    <InputText
                        // required
                        // type='number'
                        label='Bairro'
                        data={{ value: formData.baiCli }}
                        onChange={e => setFormData({ ...formData, baiCli: e.target.value })}
                    />

                    <InputText
                        // required
                        // type='number'
                        label='Complemento'
                        data={{ value: formData.cmpCli }}
                        onChange={e => setFormData({ ...formData, cmpCli: e.target.value })}
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <InputText
                        // required
                        // type='number'
                        label='Endereço'
                        data={{ value: formData.endCli }}
                        onChange={e => setFormData({ ...formData, endCli: e.target.value })}
                    />

                    <AutoComplete
                        label={'Estado'}
                        equalKey={'sigla'}
                        labelText={'nome'}
                        options={estados}
                        value={formData.uniFed}
                        // optionDisabled={fornecedores.filter(f => !f.sitFor).map(l => l.codFor)}
                        onChange={async (e) => {
                            setFormData({ ...formData, uniFed: { ...formData.uniFed, value: e } })

                            if (e === null) {
                                setCidades([])
                            } else {
                                getCities(e.sigla)
                            }
                        }}
                        onInputChange={e => setFormData({ ...formData, uniFed: { ...formData.uniFed, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ sigla, nome }) => {
                                return sigla.toUpperCase().match(formData.uniFed.inputValue.toUpperCase()) || nome.toUpperCase().match(formData.uniFed.inputValue.toUpperCase())
                            })
                        }}
                    />

                    <AutoComplete
                        label={'Cidade'}
                        options={cidades}
                        equalKey={'id'}
                        labelText={'nome'}
                        value={formData.cidCli}
                        onChange={e => setFormData({ ...formData, cidCli: { ...formData.cidCli, value: e } })}
                        onInputChange={e => setFormData({ ...formData, cidCli: { ...formData.cidCli, inputValue: e } })}
                        filter={(options) => {
                            return options.filter(({ nome }) => {
                                return nome.toUpperCase().match(formData.cidCli.inputValue.toUpperCase())
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
                            form.telCli = ReplaceList(form.telCli, ["(", ")", "-", " "])
                            form.cnpCpf = ReplaceList(form.cnpCpf, [".", "-", "/"])
                            form.cepCli = ReplaceList(form.cepCli, [".", "-"])
                            form.cidCli = form.cidCli.value == null ? '' : form.cidCli.value.id
                            form.uniFed = form.uniFed.value == null ? '' : form.uniFed.value.sigla

                            if(!CamposPreenchidos(form, ["nomCli", "cnpCpf"]))
                                return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

                            await UPDATEData({ table: "clientes", id: edit.codCli, form: form })
                            .then(res => {
                                clearAll()
                                BuscarDados()

                                const indice = clientes.findIndex(p => p.codCli === edit.codCli)
                                clientes[indice] = form

                                setSnack({ open: true, txt: "Sucesso ao atualizar o cliente", color: "success" })
                            })
                            .catch(err => setSnack({ open: true, txt: "Erro ao atualizar o cliente", color: "error" }))

                            setOpenModal(false)
                        }
                    }}
                >
                    { edit === null ? "Enviar " : "Atualizar " } cadastro
                </Button>
            </Modal>

            {/* Detalhes do cliente */}
            <Modal
                // maxWidth="md"
                onClose={() => setDetails({})}
                open={Object.keys(details).length > 0}
            >
                <header className="text-center">
                    <h3 className="m-0">
                        { details.codCli + '. ' + details.nomCli }
                    </h3>

                    <p className="m-0">
                        CPF/CNPJ: { CPFCNPJMask(details.cnpCpf) }
                    </p>
                </header>

                <hr className="mt-1" />

                <main>
                    <div className="d-flex flex-md-row flex-column text-center justify-content-between">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Telefone:</span> { TelefoneMask(details.telCli) }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">E-mail:</span> { details.emaCli }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">CEP:</span> { CEPCodeMask(details.cepCli) }
                        </p>
                    </div>

                    <div className="d-flex flex-md-row flex-column text-center justify-content-between mt-2">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Bairro:</span> { details.baiCli }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Endereço:</span> { details.endCli }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Cidade:</span> { details.nomeCidade }
                        </p>
                    </div>

                    <div className="d-flex flex-md-row flex-column text-center justify-content-between mt-2">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Estado:</span> { findField(estados, 'sigla', details.uniFed, 'nome') }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Complemento:</span> { details.cmpCli }
                        </p>
                    </div>

                    {/* <div className="d-flex flex-md-row flex-column text-center justify-content-between mt-2">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Valor do custo:</span> { CurrencyMask(details.vlrCus, 'format') }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Preço de venda:</span> { CurrencyMask(details.preVen, 'format') }
                        </p>
                    </div> */}

                    <p className="m-0 mt-3 text-center" style={{ fontSize: 14 }}>
                        <span className="fw-bold">Data/Hora do cadastro:</span> { details.datCad }
                    </p>
                </main>
            </Modal>
        </AdminLayout>
    )
}