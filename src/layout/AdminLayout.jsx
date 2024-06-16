import styles from "../styles/Home.module.css";
import { Context_data } from "../context/Context";
import { useContext, useEffect, useState } from "react";
// Componentes
import NoSSR from "../components/NoSSR";
import Preloader from "../components/Preloader";
// Componetes extra
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const menu = [
    [
        { icon: 'fa-chart-column', label: 'Dashboard', href: 'dashboard' },
        { icon: 'fa-box-open', label: 'Produtos', href: 'produtos' },
    ],
    [
        { icon: 'fa-dolly', label: 'Entrada de estoque', href: 'entrada-estoque' },
        { icon: 'fa-truck-ramp-box', label: 'Saída de estoque', href: 'saida-estoque' },
    ],
    [
        { icon: 'fa-truck-fast', label: 'Fornecedores', href: 'fornecedores' },
        { icon: 'fa-users', label: 'Clientes', href: 'clientes' },
    ]
]

export default function AdminLayout({ children }) {
    const [load, setLoad] = useState(false)
    const [showMenu, setShowMenu] = useState(true)

    const { windowWidth, windowHeight } = useContext(Context_data)

    const opened = (retIf, retElse) => showMenu ? retIf : retElse

    return (
        <NoSSR>
            <Preloader open={load} />

            <div
                style={{ gap: 12, backgroundColor: '#0c0b10' }}
                className="min-vh-100 d-flex flex-sm-row flex-column p-2 shadow-lg text-white"
            >
                <div
                    style={{ width: windowWidth <= 576 ? '100%' : 350 }}
                    className="text-center position-relative pb-2 rounded"
                >
                    {
                        windowWidth > 576 ? null :
                        <FontAwesomeIcon
                            className="position-absolute"
                            onClick={() => setShowMenu(!showMenu)}
                            icon={showMenu ? 'fa-xmark' : 'fa-bars'}
                            style={{ top: 10, right: 10, fontSize: 18, cursor: 'pointer' }}
                        />
                    }

                    <img src="/assets/logo-gr.png" alt="Logo GR Distribuidora" style={{ width: 150 }} />

                    <h5 className="m-0 fw-bold">
                        Distribuidora de bebidas
                    </h5>

                    <hr className="m-0 mt-1 mb-2" />

                    <nav
                        style={{
                            // border: '1px solid red',
                            overflow: 'hidden',
                            transition: 'max-height .7s',
                            maxHeight: windowWidth <= 576 ? opened(500, 0) : 'max-content',
                        }}
                    >
                        {
                            menu.map((m, index) => (
                                <section key={index} className="d-flex justify-content-evenly mb-2" style={{ gap: 8 }}>
                                    { m.map(me => <Button key={me.href} icon={me.icon} label={me.label} identify={me.href} setLoad={setLoad} />) }
                                </section>
                            ))
                        }
                    </nav>

                    <section className={`position-${windowWidth <= 576 ? 'static mt-2' : 'absolute'} text-center w-100`} style={{ fontSize: 12, bottom: 0 }}>
                        Desenvolvido por Joane Amorim e Heloísa Souza
                    </section>
                </div>

                <Card
                    className={`w-100 ${windowWidth <= 576 ? '' : 'p-1 ps-0'}`}
                    style={{ height: windowWidth <= 576 ? windowHeight + 50 : windowHeight - 20, overflowX: "hidden", overflowY: "auto" }}
                >
                    { children }
                </Card>
            </div>
        </NoSSR>
    )
}

export function Card({ children, style = {}, className = '' }) {
    return (
        <div
            className={className}
            // style={Object.assign({}, style, { flexGrow: 1, flexBasis: "200px" })}
            style={style}
        >
            { children }
        </div>

    )
}

const Button = ({ icon, label, identify, setLoad }) => {
    const router = useRouter()

    const isCurrent = (retIf, retElse = '') => '/' + identify === router.asPath ? retIf : retElse

    return (
        <span
            onClick={() => {
                if(router.asPath !== '/' + identify) {
                    setLoad(true)
                    router.push('/' + identify)
                }
            }}
            style={{ border: isCurrent('2px solid white') }}
            className={`d-flex flex-column justify-content-center align-items-center py-2 ${styles.button} ${isCurrent(styles.selected)}`}
        >
            <FontAwesomeIcon icon={icon} size="2x" />
            <p className="m-0" style={{ fontSize: 18 }}>{label}</p>
        </span>
    )
}