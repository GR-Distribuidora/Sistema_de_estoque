import AdminLayout from "../layout/AdminLayout"
// JS imports
import axios from "axios";
import { useContext, useState } from "react";
import { CurrencyMask } from "../functions/masks";
import { ConvertTimestamp, OrderBy } from "../functions/auxiliar";
import { GETData, BuscarRegistrosPorMesAno, BuscarDadosHoje } from "../services/functions";
// Componentes visuais
import Table from "../components/Table";
import BarChart from "../components/Chart";
import SnackAlert from '../components/SnackAlert';
import { Context_data } from "../context/Context";
import Card, { Body, Indicator, StackPage } from "../components/Card";
// Componentes visuais externos
import { Container, Row, Col } from "react-bootstrap";

// Função para filtrar os produtos prestes a vencer com margem de 10 dias
function ProdutosPrestesAVencer(produtos) {
    const diferencaEmDias = (data1, data2) => {
        const umDia = 24 * 60 * 60 * 1000
        return Math.round(Math.abs((data1 - data2) / umDia))
    }

    let hoje = new Date() // Data atual

    return produtos.filter(produto => {
        // Converter a string da data do produto para um objeto Date
        let partesData = produto.datVal.split('/')
        let dataProduto = new Date(partesData[2], partesData[1] - 1, partesData[0])
        
        // Calcular a diferença em dias entre a data atual e a data do produto
        let diferencaDias = diferencaEmDias(dataProduto, hoje)
        
        // Retornar true se a diferença for menor ou igual a 10 dias
        return diferencaDias <= 10
    })
}

function OrganizarDadosDashboard(date, produtos, entEstoque, saiEstoque) {
    const dashboard = {
        date: date,
        indicadores: { vlrTotal: 0, qtdProd: 0, qtdEnt: 0, qtdSai: 0 },
        produtosMaisVendidos: [],
        estoqueMinimo: [],
        proximosVencer: ProdutosPrestesAVencer(entEstoque)
    }

    produtos.forEach(l => {
        dashboard.indicadores.vlrTotal += l.preVen * l.estAtu
        dashboard.indicadores.qtdProd += Number(l.estAtu)
    })

    dashboard.indicadores.qtdEnt = entEstoque.filter(l => l.datEnt === date).length
    dashboard.indicadores.qtdSai = saiEstoque.filter(l => l.datCad.split(' | ')[0] === date).length
    dashboard.estoqueMinimo = produtos.filter(l => Number(l.estAtu) <= Number(l.estMin))

    const produtosSaida = saiEstoque.sort((a, b) => parseFloat(a.qtdSai) - parseFloat(b.qtdSai))

    for(let i = 0; i < 10; i++) {
        if(produtosSaida[i] == undefined)
            break;

        const index = dashboard.produtosMaisVendidos.findIndex(l => l.codPro == produtosSaida[i].codPro)

        if(index <= -1) {
            dashboard.produtosMaisVendidos.push({
                ...produtosSaida[i],
                nomPro: seeField(produtos, 'codBar', produtosSaida[i].codPro, 'nomPro', 'PRODUTO NÃO ENCONTRADO OU EXCLUÍDO')
            })
        } else {
            dashboard.produtosMaisVendidos[index].qtdSai += Number(produtosSaida[i].qtdSai)
        }
    }

    return dashboard
}

export async function getServerSideProps() {
    let date = new Date()

    const listData = await Promise.all([
        GETData({ table: "produtos" }),
        GETData({ table: "entrada-estoque" }),
        BuscarRegistrosPorMesAno("saida-estoque", Number(date.getMonth() + 1), date.getFullYear())
    ])

    listData[2].forEach(l => l.datCad = ConvertTimestamp(l.datCad.toDate("pt-br"), false).replace(', ', ' | '))
    date = date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    return {
        props: {
            produtos: listData[0],
            dashboard: OrganizarDadosDashboard(date, listData[0], listData[1], listData[2])
        }
    }
}

const seeField = (list, fieldKey, value, field, notFound = '') => list.find(p => p[fieldKey] == value) === undefined ? notFound : list.find(p => p[fieldKey] == value)[field]

export default function Dashboard({ produtos, dashboard }) {
    const { indicadores, estoqueMinimo, proximosVencer, produtosMaisVendidos } = dashboard
    const { windowWidth } = useContext(Context_data)

    const currentDate = new Date()
    const month = (currentDate.getMonth() + 1).toString().length == 1 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`

    const [snack, setSnack] = useState({ open: false, txt: '', color: '' })
    const [date, setDate] = useState(`${currentDate.getFullYear()}-${month}`)
    const [listaProdMaisVen, setListaProdMaisVen] = useState(produtosMaisVendidos)

    async function FiltrarDados(data) {
        setDate(data)
        const formatData = data.split('-') // yyyy-mm

        await BuscarRegistrosPorMesAno("saida-estoque", Number(formatData[1]), formatData[0])
        .then(res => {
            let result = []

            for(let i = 0; i < 10; i++) {
                if(res[i] == undefined)
                    break;

                const index = result.findIndex(l => l.codPro == res[i].codPro)

                if(index <= -1) {
                    result.push({ ...res[i], nomPro: seeField(produtos, 'codBar', res[i].codPro, 'nomPro', 'PRODUTO NÃO ENCONTRADO OU EXCLUÍDO') })
                } else {
                    result[index].qtdSai += Number(res[i].qtdSai)
                }
            }

            setListaProdMaisVen(result)
        })
        .catch(err => {
            setSnack({ open: true, txt: 'Erro ao buscar os registros', color: 'error' })
        })
    }

    return (
        <AdminLayout>
            <SnackAlert flag={snack.open} handleCloseSnackbar={() => setSnack({ ...snack, open: false })} txt={snack.txt} color={snack.color} />

            <Body className="pt-3">
                <header>
                    <Container fluid>
                        <Row className="gap-3">
                            <Col key={"fa-hand-holding-dollar"} className="px-0" sm>
                                <Indicator icon={"fa-hand-holding-dollar"} color={"#462c82"} title={CurrencyMask(indicadores.vlrTotal, 'format')} description={"Valor total no estoque"} />
                            </Col>

                            <Col key={"fa-boxes-stacked"} className="px-0" sm>
                                <Indicator icon={"fa-boxes-stacked"} color={"#2881a1"} title={indicadores.qtdProd} description={"Produtos no estoque"} />
                            </Col>

                            <Col key={"fa-arrow-trend-down"} className="px-0" sm>
                                <Indicator icon={"fa-arrow-trend-down"} color={"#ab552c"} title={indicadores.qtdEnt} description={"Movimentos de entrada de hoje"} />
                            </Col>

                            <Col key={"fa-arrow-trend-up"} className="px-0" sm>
                                <Indicator icon={"fa-arrow-trend-up"} color={"#753e6f"} title={indicadores.qtdSai} description={"Movimentos de saída de hoje"} />
                            </Col>
                        </Row>
                    </Container>
                </header>

                <main>
                    <StackPage direction={{ sm: 'column', md: 'row' }}>
                        <Card
                            className="mt-3 w-100"
                            style={{ minHeight: 400 }}
                            title={"Top 10 produtos"}
                            description={"Acompanhe aqui os 10 produtos mais vendidos"}
                            componentSide={
                                <input
                                    type="month"
                                    value={date}
                                    onChange={e => FiltrarDados(e.target.value)}
                                    max={`${currentDate.getFullYear()}-${month}`}
                                    className="bg-dark text-white border-0 p-2 rounded shadow-sm"
                                />
                            }
                        >
                            <BarChart
                                label={'nomPro'}
                                value={'qtdSai'}
                                labels={listaProdMaisVen}
                            />
                        </Card>

                        <Card
                            title={"Estoque mínimo"}
                            style={{ maxHeight: 455, overflowY: 'auto' }}
                            description={"Veja os produtos com estoque mínimo"}
                            className={`mt-3 ${windowWidth < 900 ? "w-100" : "w-50"}`}
                        >
                            <Table
                                idRow="codBar"
                                rows={estoqueMinimo}
                                emptyMessage='Os produtos aparecerão aqui'
                                header={[
                                    { title: 'Nome', sync: 'nomPro', style: { maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                                    { title: 'Qtd', sync: 'estAtu' }
                                ]}
                            />
                        </Card>
                    </StackPage>
                </main>

                <Card
                    className="mt-3 w-100"
                    title={"Alerta de validade"}
                    description={"Acompanhe aqui os produtos que vão expirar nos próximos 10 dias"}
                >
                    <Table
                        idRow='codEnt'
                        heightTable="300px"
                        rows={proximosVencer}
                        emptyMessage='Os produtos aparecerão aqui'
                        header={[
                            { title: 'Código de barras', sync: 'codPro' },
                            { title: 'Produto', sync: 'codPro', format: e => seeField(produtos, 'codBar', e, 'nomPro') },
                            { title: 'Validade', sync: 'datVal' },
                            { title: 'Lote', sync: 'codLot' },
                            { title: 'Quantidade', sync: 'qtdEnt' },
                        ]}
                    />
                </Card>
            </Body>
        </AdminLayout>
    )
}
