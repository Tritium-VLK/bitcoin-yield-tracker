import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { getOpportunities } from '../lib/opportunities'
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then(res => res.json())
var jp = require('jsonpath')

export async function getStaticProps() {
    const allOpportunities = getOpportunities()
    return {
        props: {
            allOpportunities
        }
    }
}

export default function Home({ allOpportunities }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Bitcoin Yield Tracker</title>
        <meta name="description" content="Tracks DeFi and CeFi Bitcoin yield opportunities." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Bitcoin Yield Tracker
        </h1>

          {allOpportunities.map((opp) => (
            <ul className={styles.opportunity}>
              <li key={opp.id}>
                {opp.name}
              </li>
              <li>
                {opp.category}
              </li>
              <li>
                <Rate opp={opp}/>
              </li>
            </ul>
          ))}
      </main>

    </div>
  )
}

export function Rate(props) {
    const { data, error } = useSWR(props.opp.api, fetcher)

    // Parse the rate data from response.
    if (!error && typeof data !== 'undefined') {
        if (typeof props.opp.json_path_rate !== 'undefined') {
            return jp.query(data, props.opp.json_path_rate)
        }
    }

    return 'error'
}

