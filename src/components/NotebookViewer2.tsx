import React from "react";
import useSWR from 'swr'
import { IpynbRenderer } from "react-ipynb-renderer"

const fetcher = (url) => fetch(url).then((res) => res.json());

const NotebookViewer = (props) => {
  const { filePath } = props;

  const { data, error, isLoading } = useSWR(`/${filePath}`, fetcher)

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  return <IpynbRenderer ipynb={data} syntaxTheme='solarizedlight' />
}

export default NotebookViewer;
