import "src/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
     return (
          <main>
               <Head>
                    <title>SwiftWhisper</title>
                    <link rel="icon" type="image/x-icon" href="/logo.png" />
               </Head>
               <Component {...pageProps} />
          </main>
     );
}