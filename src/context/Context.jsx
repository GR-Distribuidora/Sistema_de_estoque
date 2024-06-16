import { createContext, useState, useEffect } from "react";

export const Context_data = createContext()

export default function Context({ children }) {
    // Largura e tamanho da página
    const [windowWidth, setWindowWidth] = useState(0) // Largura da tela
    const [windowHeight, setWindowHeight] = useState(0) // Altura da tela

    const [currentPage, setCurrentPage] = useState('produtos')

    // Atualiza o tamanho da tela no estado
    useEffect(() => {
        setWindowHeight(window.innerHeight)
        setWindowWidth(window.innerWidth)

        window.addEventListener("resize", () => {
            setWindowHeight(window.innerHeight)
            setWindowWidth(window.innerWidth)
        })

        return () => window.removeEventListener("resize", () => {
            setWindowHeight(window.innerHeight)
            setWindowWidth(window.innerWidth)
        })
    }, [])

    return(
        <Context_data.Provider
            value={{
                windowWidth, windowHeight,
                currentPage, setCurrentPage
            }}
        >
            { children }
        </Context_data.Provider>
    )
}