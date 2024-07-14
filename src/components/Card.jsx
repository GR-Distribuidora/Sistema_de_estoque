import { useContext } from "react"
import { Stack } from "@mui/material"
import Card from 'react-bootstrap/Card';
import scroll from "../styles/Table.module.css"
import { Context_data } from "../context/Context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function PrincipalCard({ children, title, description, style = {}, className = '', componentSide = null }) {
    return (
        <Card
            style={Object.assign({}, style, { backgroundColor: "#100e14" })}
            className={`text-white shadow ${scroll.scrollY} ${className}`}
        >
            <Card.Header
                style={{ borderBottom: "1px solid #2b2833" }}
                className="d-flex align-items-center justify-content-between"
            >
                <section>
                    <h4 className="m-0">
                        { title }
                    </h4>

                    <p className="m-0">
                        { description }
                    </p>
                </section>

                <section>
                    { componentSide }
                </section>
            </Card.Header>

            <Card.Body className="w-100">
                { children }
            </Card.Body>
        </Card>
    )
}

export const Row = ({ children }) => (
    <div
        style={{ gap: 12 }}
        className="d-flex flex-wrap"
    >
        { children }
    </div>
)

export const Body = ({ children, title, description, className = '' }) => {
    const { windowHeight } = useContext(Context_data)

    return (
        <div
            className={"position-relative"}
            style={{
                backgroundColor: "#1f1e25",
                minHeight: windowHeight - 28,
                // border: '1px solid red'
            }}
        >
            {
                title == undefined ? null :
                <>
                    <header className="px-3 pt-2">
                        <h2 className="m-0 fw-bold">
                            { title }
                        </h2>
                        
                        <p className="m-0">
                            { description }
                        </p>
                    </header>

                    <hr className="m-3 mt-1" />
                </>
            }

            <main className={"p-3 pt-0 " + className}>
                { children }
            </main>
        </div>
    )
}

export const DivForm = ({ children }) => (
    <div
        className="shadow rounded p-3"
        style={{ border: '1px solid #a8a8a8' }}
    >
        { children }
    </div>
)

export const StackPage = ({ children, className = '', direction = { xs: 'column', sm: 'row' } }) => (
    <Stack
        spacing={1.5}
        className={className}
        direction={direction}
    >
        { children }
    </Stack>
)

export const Indicator = ({ icon, color = "#25212b", title, description }) => (
    <div
        className="w-100 rounded shadow d-flex p-3"
        style={{ height: 100, backgroundColor: "#100e14", gap: 18 }}
    >
        <section
            className="p-3 shadow rounded"
            style={{
                // border: '1px solid #696775',
                // background: "linear-gradient(90deg, rgba(31,53,88,1) 0%, rgba(49,93,163,1) 35%, rgba(28,92,194,1) 100%)"
                backgroundColor: color
            }}
        >
            <FontAwesomeIcon icon={icon} style={{ fontSize: 36 }} />
        </section>

        <section>
            <h4 className="m-0 fw-bold">
                { title }
            </h4>

            <p className="m-0" style={{ fontSize: 14 }}>
                { description }
            </p>
        </section>
    </div>
)