import dynamic from "next/dynamic";

// Adia o carregamento de alguns componentes do client-side.
// Isso auxilia na mudança de tema do usuário
const NoSSR = ({ children }) => (
    <>
        { children }
    </>
)

export default dynamic(() => Promise.resolve(NoSSR), { ssr: false })