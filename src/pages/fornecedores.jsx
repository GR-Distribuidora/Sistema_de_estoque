import { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { CPFCNPJMask, TelefoneMask } from "../functions/masks";
import { CamposPreenchidos, DeepCopy, ReplaceList } from "../functions/auxiliar";
import { GETData, POSTData, UPDATEData, DELETEData } from "../services/functions";
// Componentes
import { Button } from "@mui/material";
import Modal from "../components/Modal";
import Table from "../components/Table";
import Preloader from "../components/Preloader";
import SnackAlert from '../components/SnackAlert';
import { Body, StackPage } from "../components/Card";
import InputText, { SelectOption } from "../components/Input";

export async function getServerSideProps() {
    return {
        props: {
            fornecedores: await GETData({ table: "fornecedores" })
        }
    }
}

const optionsFilter = [
    { value: 'codFor', label: 'Código do fornecedor' },
    { value: 'nomFor', label: 'Nome' },
    // { value: 'cnpFor', label: 'CPF/CNPJ' },
    // { value: 'telFor', label: 'Telefone' },
    { value: 'emaFor', label: 'E-mail' },
]

export default function Fornecedores({ fornecedores }) {
    // console.log(fornecedores)

    const [load, setLoad] = useState(false)
    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })
    const [openModal, setOpenModal] = useState(false) // Abre e fecha o modal

    const [rows, setRows] = useState(fornecedores.reverse())
    const [filter, setFilter] = useState({ vlrInput: '', field: 'codFor' })

    const [edit, setEdit] = useState(null)
    const [details, setDetails] = useState({})
    const [formData, setFormData] = useState({
        nomFor: '', telFor: '', emaFor: '', sitFor: true, cnpFor: ''
    })

    useEffect(() => {
        if(edit != null) {
            setOpenModal(true)
            setFormData({ nomFor: edit.nomFor, telFor: TelefoneMask(edit.telFor), emaFor: edit.emaFor, sitFor: edit.sitFor, cnpFor: CPFCNPJMask(edit.cnpFor) })
        }
    }, [edit])

    const clearAll = () => {
        setEdit(null)
        setFormData({ nomFor: '', telFor: '', emaFor: '', sitFor: true, cnpFor: '' })
    }

    const filterData = value => {
        setFilter({ ...filter, vlrInput: value })

        if(((/^[A-Z0-9.@\u00C0-\u00FF\s]*$/).test(value.toUpperCase()))) {
            const filtered = fornecedores.filter(r => r[filter.field] != null && r[filter.field].toString().toUpperCase().match(value.toString().toUpperCase()))
            setRows(filtered)
        } else {
            setRows(fornecedores)
        }
    }

    async function BuscarDados(isDelete = false) {
        setLoad(true)

        await GETData({ table: "fornecedores" })
        .then(res => {
            if(!isDelete && res.length === 0)
                return setSnack({ open: true, txt: 'Voce ainda não possui nenhum fornecedor cadastrado', color: 'info' })

            setRows(res.reverse())
        })
        .catch(err => {
            // console.log(err)
            setSnack({ open: true, txt: 'Erro ao buscar os fornecedores', color: 'error' })
        })

        setLoad(false)
    }

    async function GravarDados() {
        const id = await GETData({ table: "fornecedores" })

        const form = DeepCopy({ ...formData })
        form.codFor = (id.length + 1).toString()
        form.telFor = ReplaceList(form.telFor, ["(", ")", "-", " "])
        form.cnpFor = ReplaceList(form.cnpFor, [".", "-", "/"])
        form.datCad = new Date().toLocaleString()

        if(!CamposPreenchidos(form, ["nomFor", "cnpFor"]))
            return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

        setLoad(true)

        await POSTData({ table: "fornecedores", form: form, primaryKey: form.codFor })
        .then(res => {
            switch(res) {
                case "OK":
                    clearAll()
                    BuscarDados()
                    setOpenModal(false)
                    setSnack({ open: true, txt: "Fornecedor cadastrado com sucesso", color: "success" })
                break;

                case "EXISTE":
                    setSnack({ open: true, txt: "Já existe um fornecedor com esse código cadastrado", color: "warning" })
                break;

                default:
                    setSnack({ open: true, txt: "Erro ao cadastrar o fornecedor", color: "error" })
                break;
            }
        })
        .catch(err => {
            setSnack({ open: true, txt: 'Erro ao cadastrar fornecedor', color: 'error' })
        })

        setLoad(false)
    }

    return (
        <AdminLayout>
            <Preloader open={load} />
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body
                title="Fornecedores"
                description="Faça aqui os cadastros dos seus fornecedores"
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
                    idRow='codFor'
                    emptyMessage='Os fornecedores aparecerão aqui'
                    header={[
                        { title: 'Situação', sync: 'sitFor', format: e => e ? '🟢' : '🔴' },
                        { title: 'Código', sync: 'codFor' },
                        { title: 'Nome', sync: 'nomFor' },
                        { title: 'CPF/CNPJ', sync: 'cnpFor', format: e => CPFCNPJMask(e) },
                        { title: 'Data/Hora do cadastro', sync: 'datCad', format: e => e.replace(', ', ' | ') },
                    ]}
                    showDeleteButton={async (id) => {
                        if(!confirm('Deseja realmente excluir esse registro?'))
                            return

                        await DELETEData({ table: 'fornecedores', primaryKey: id })
                        .then(() => {
                            BuscarDados(true)
                            setSnack({ open: true, txt: 'Fornecedor excluído com sucesso', color: 'success' })
                        })
                        .catch(() => setSnack({ open: true, txt: 'Erro ao excluir o fornecedor', color: 'error' }))
                    }}
                    showEditButton={row => setEdit(row)}
                    showCustomButton={(row, id) => setDetails(row)}
                />

                <Button
                    // color="success"
                    variant="contained"
                    className="position-absolute"
                    onClick={() => setOpenModal(true)}
                    style={{ bottom: 10, right: 10, left: 10 }}
                >
                    Cadastrar fornecedor
                </Button>
            </Body>

            {/* Cadastrar Fornecedor */}
            <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false)
                    clearAll()
                }}
            >
                <h3 className="m-0">
                    { edit == null ? 'Cadastrar novo' : 'Editar' } fornecedor
                </h3>

                <hr className="mt-1" />

                <StackPage>
                    <InputText
                        required
                        label='Nome'
                        data={{ value: formData.nomFor }}
                        onChange={e => setFormData({ ...formData, nomFor: e.target.value })}
                    />

                    <InputText
                        required
                        label='CPF/CNPJ'
                        data={{ value: formData.cnpFor }}
                        onChange={e => {
                            if((/^[\d.\/\-]+$/).test(e.target.value) || e.target.value == '')
                                setFormData({ ...formData, cnpFor: e.target.value })
                        }}
                        mask={
                            ReplaceList(formData.cnpFor, ['.', '-', '/']).length >= 11 ?
                            '##.###.###/####-##' : '###.###.###-###'
                        }
                    />
                </StackPage>

                <StackPage className="mt-3">
                    <InputText
                        label='E-mail'
                        data={{ value: formData.emaFor }}
                        onChange={e => setFormData({ ...formData, emaFor: e.target.value })}
                    />

                    <InputText
                        // required
                        // type='number'
                        label='Telefone'
                        mask={'(##)# ####-####'}
                        data={{ value: formData.telFor }}
                        onChange={e => setFormData({ ...formData, telFor: e.target.value })}
                    />

                    <SelectOption
                        title={'Situação do fornecedor'}
                        value={formData.sitFor.toString() || ''}
                        onChange={e => setFormData({ ...formData, sitFor: e.target.value })}
                        options={[{ value: true, label: '🟢 Ativo' }, { value: false, label: '🔴 Inativo' }]}
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
                            form.telFor = ReplaceList(form.telFor, ["(", ")", "-", " "])
                            form.cnpFor = ReplaceList(form.cnpFor, [".", "-", "/"])

                            if(!CamposPreenchidos(form, ["nomFor", "cnpFor"]))
                                return setSnack({ open: true, txt: "Preencha todos os campos obrigatórios*", color: "warning" })

                            await UPDATEData({ table: "fornecedores", id: edit.codFor, form: form })
                            .then(res => {
                                clearAll()
                                BuscarDados()

                                const indice = fornecedores.findIndex(p => p.codFor === edit.codFor)
                                fornecedores[indice] = form

                                setSnack({ open: true, txt: "Sucesso ao atualizar o fornecedor", color: "success" })
                            })
                            .catch(err => setSnack({ open: true, txt: "Erro ao atualizar o fornecedor", color: "error" }))

                            setOpenModal(false)
                        }
                    }}
                >
                    { edit === null ? "Enviar " : "Atualizar " } cadastro
                </Button>
            </Modal>

            {/* Detalhes do Fornecedor */}
            <Modal
                // maxWidth="md"
                onClose={() => setDetails({})}
                open={Object.keys(details).length > 0}
            >
                <header className="text-center">
                    <h3 className="m-0">
                        { details.codFor + '. ' + details.nomFor }
                    </h3>

                    <p className="m-0">
                        CPF/CNPJ: { CPFCNPJMask(details.cnpFor) }
                    </p>
                </header>

                <hr className="mt-1" />

                <main>
                    <div className="d-flex flex-md-row flex-column text-center justify-content-between">
                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Telefone:</span> { TelefoneMask(details.telFor) }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">E-mail:</span> { details.emaFor }
                        </p>

                        <p className="m-0" style={{ fontSize: 18 }}>
                            <span className="fw-bold">Situação:</span> { details.sitFor ? '🟢 Ativo' : '🔴 Inativo' }
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
