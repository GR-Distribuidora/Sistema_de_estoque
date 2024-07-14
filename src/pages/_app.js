import Head from "next/head";
import "../styles/globals.css";
import Context from '../context/Context';
// Material UI Imports
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// React Bootstrap Imports
import 'bootstrap/dist/css/bootstrap.min.css';
// Fontawesome Imports
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
const { library } = require('@fortawesome/fontawesome-svg-core');
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, far, fab);
config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Gestão de estoque</title>
        <link rel="icon" href="/assets/logo-gr.png" />
        {/* <meta name="description" content="O Sintax é um sistema web de gestão empresarial para pequenas e médias empresas." /> */}
      </Head>

      {/* <SSRProvider>
        <SessionProvider session={pageProps.session}> */}
          <Context>
            <Component {...pageProps} />
          </Context>
        {/* </SessionProvider>
      </SSRProvider> */}
    </>
  )
}