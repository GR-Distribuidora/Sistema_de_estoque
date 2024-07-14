import Modal from "./Modal";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import styles from "../styles/Table.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Table({ header, rows, className, idRow = 'id', showEditButton = null, showDeleteButton = null, showCustomButton = null, emptyMessage = 'Os dados aparecerão aqui', emptyStyle = {}, heightTable = 'auto' }) {
    const [head, setHead] = useState([]) // Cabeçalho da tabela
    const [list, setList] = useState([]) // Linhas da tabela

    // Adiciona um id dinamicamente ao cabeçalho
    useEffect(() => {
        const auxHeader = []
        for(let i = 0; i < header.length; i++)
            auxHeader.push(Object.assign({}, { id: i+1 }, header[i]))

        setHead(auxHeader)
    }, [header])

    useEffect(() => {
        const copy = [...rows]
        copy.forEach(r => r.menu = false)
        setList(copy)
    }, [rows])

    // useEffect(() => {
    //     window.addEventListener('click', function (e) {
    //         if(!(typeof e.target.className == "string" && e.target.className.includes('rowTable'))) {
    //             const copy = [...list]
    //             copy.forEach(c => c.menu = false)
    //             // console.log(copy)
    //             setList(copy)
    //         }
    //     })
    // }, [])

    const openMenu = i => {
        const copy = [...list]
        copy[i].menu = !copy[i].menu // true
        setList(copy)
    }

    return (
        <>
            <div className={styles.scrollY} style={{ maxHeight: heightTable, overflowY: 'auto' }}>
                {/* Tabela com CSS para scroll */}
                <section style={{ overflowX: 'auto' }} className={`shadow-lg ${styles.sidebarScrollX} ${styles.tableScrollBar}`}>
                    <section
                        className={`table-responsive ${className}`}
                        style={{ maxWidth: '5000px', width: 'max-content', minWidth: '100%' }}
                    >
                        <table
                            // style={{ backgroundColor: "#462c82" }}
                            className={`table table-dark table-hover mb-0`}
                        >
                            <thead>
                                <tr className='align-middle'>
                                    {
                                        showDeleteButton !== null && showCustomButton === null ?
                                            <th
                                                className="text-center fw-bold"
                                                style={{ width: 80, letterSpacing: 0.5 }}
                                            >
                                                #
                                            </th>
                                        : null
                                    }

                                    {
                                        showCustomButton === null ? null :
                                        <th
                                            className="text-center fw-bold"
                                            style={{ width: 80, letterSpacing: 0.5 }}
                                        >
                                            Opções
                                        </th>
                                    }

                                    {
                                        head.map(item =>
                                            <th
                                                key={item.id}
                                                className={item.classHeader}
                                                style={{ letterSpacing: 0.5, cursor: item.order ? 'pointer' : '' }}
                                            >
                                                { item.icon == undefined ? null : <FontAwesomeIcon icon={item.icon} /> }

                                                <span className='d-flex justify-content-between align-items-center fw-bold' style={{ gap: 6 }}>
                                                    { item.title }
                                                </span>
                                            </th>
                                        )
                                    }
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    list.map((r, index) =>
                                        <tr key={r[idRow]} /* onClick={() => setOptions(true)} style={{ cursor: "pointer" }} */>
                                            {
                                                showDeleteButton !== null && showCustomButton === null ?
                                                    <td
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => showDeleteButton(r)}
                                                        className="p-0 m-0 position-relative rowTable"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={'fa-trash'}
                                                            className="position-absolute"
                                                            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px' }}
                                                        />
                                                    </td>
                                                : null
                                            }

                                            {
                                                showCustomButton === null ? null :
                                                <td
                                                    style={{ cursor: 'pointer' }}
                                                    className="p-0 m-0 position-relative rowTable"
                                                    onClick={() => openMenu(index)}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={'fa-ellipsis'}
                                                        className="position-absolute rowTable"
                                                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px' }}
                                                        // onClick={() => {
                                                        //     // openMenu(index)
                                                        //     const copy = [...list]
                                                        //     copy[index].menu = true
                                                        //     setList(copy)
                                                        // }}
                                                    />

                                                    <div
                                                        style={{ outline: '1px solid gray', backgroundColor: '#f9f9f9', width: 100, left: 53, bottom: 0 }}
                                                        className={`position-absolute p-1 rowTable rounded d-${r.menu ? 'flex' : 'none'} flex-column justify-content-between align-items-center`}
                                                    >
                                                        <span className="m-0 w-100 text-center fw-bold rowTable text-black" onClick={() => showCustomButton(r, r[idRow])}>Visualizar</span>
                                                        <span className="m-0 w-100 text-center fw-bold rowTable text-danger" onClick={() => showDeleteButton(r[idRow])}>Excluir</span>
                                                        <span className="m-0 w-100 text-center fw-bold rowTable text-primary" onClick={() => showEditButton(r)}>Editar</span>
                                                    </div>
                                                </td>
                                            }

                                            {
                                                head.map(h => (
                                                    <td
                                                        key={h.id}
                                                        style={h.style}
                                                        title={h.format == undefined ? r[h.sync] : h.format(r[h.sync], r)}
                                                        className={`text-${h.align == undefined ? 'left' : h.align} ${h.classRow}`}
                                                    >
                                                        { h.format == undefined ? r[h.sync] : h.format(r[h.sync], r) }
                                                    </td>
                                                ))
                                            }
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </section>
                </section>

                {/* Mensagem de tabela vazia */}
                {
                    list.length > 0 ? null :
                    <div
                        style={emptyStyle}
                        className={`py-2 h-100 text-center text-white bg-dark`}
                    >
                        { emptyMessage }
                    </div>
                }
            </div>
        </>
    )
}