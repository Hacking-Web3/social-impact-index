import {FC, useEffect, useState} from "react"
import {Link} from "react-router-dom"
import { ISIOData } from './SIOModal'


export interface ISIOList {
  sios: string[];
}

export const SIOList:FC<ISIOList> = (props) => {

  const [siosFull, setSiosData] = useState<Map<string, ISIOData>>(new Map<string, ISIOData>()); 

  useEffect(() => {
    const fetchData = async () => {
    for await (const sio of props.sios) {
      if (!siosFull.get(sio)) {
        const result = await window.ceramic?.loadStream(sio);
        setSiosData(oldInfo => {oldInfo.set(sio, result?.content); return oldInfo});
      }
    }
    }

    fetchData().catch(console.log);
  }, [props.sios])
  console.log(props.sios);
  console.log(siosFull)

  return (<>{ props.sios.map(streamId => <><Link to={`/sio/${streamId}`} >{siosFull?.get(streamId)?.name || "Loading"}</Link><br /></>) }
  </>);
}

