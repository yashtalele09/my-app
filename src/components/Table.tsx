import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageEvent} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { FaAngleDown } from "react-icons/fa";

interface Artwork{
    title?:string;
    place_of_origin?:string;
    artist_display?:string;
    inscriptions?:string;
    date_start?:number;
    date_end?:number;
}

const Table = () => {

    const [artwork, setArtwork] = useState<Artwork[]>([])
    const [allRecords, setAllRecords] = useState(0);
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0);
    const [rows, setRows] = useState(12)
    const [inputValue, setInputValue] = useState()
    const [SelectRows, setSelectRows] = useState<Artwork[]>([])
    
    const op = useRef(null)

    useEffect(()=>{
        getData()
    },[page, rows])

    const getData = async() => {
        setLoading(true)
        try {
            const result = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page+1}&limit=${rows}`);
            const data = await result.json();
            setArtwork(data.data);
            setAllRecords(data.pagination.total)
            setLoading(false)
        } catch (error) {
            console.log('error:',error)
        }
      
    }

    const pageEvent = (event: DataTablePageEvent,) => {
        setPage(event.page)
        setRows(event.rows)
    }

    const selectNumberRows = () => {

        const selectedNumberRows = Number(inputValue)

        if (Number.isInteger(selectedNumberRows) && selectedNumberRows > 0) {
            
            selectRowsAllPages(selectedNumberRows);
        } else {
            setSelectRows([]);  
        }
    }

    const selectRowsAllPages = async (numRows: number) => {
        let selectedRows: Artwork[] = [];
        let remainingRows = numRows;
        let nowPageIs = 0;
    
        while (remainingRows > 0) {
          try {
            const result = await fetch(`https://api.artic.edu/api/v1/artworks?page=${nowPageIs + 1}&limit=${rows}`)
            const data = await result.json();
            const resultData = data.data;
            if (resultData.length === 0) break; 
            const rowsToTake = Math.min(remainingRows, resultData.length);
            selectedRows = [...selectedRows, ...resultData.slice(0, rowsToTake)];
            remainingRows -= rowsToTake;
            nowPageIs++;
          } catch (error) {
            console.error('Error fetching rows across pages:', error);
            break;
          }
        }
    
        setSelectRows(selectedRows);
      };
    

    const overlayPanel = () => {
       return(  
       <>
        <Button
            icon="pi pi-ellipsis-v"
            className="p-button-text"
            onClick={(e) => op.current.toggle(e)} 
        ><FaAngleDown /></Button>
        <OverlayPanel ref={op} appendTo={document.body}>
            <input type='number' placeholder='Select Rows' value={inputValue} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setInputValue(e.target.value)}} style={{padding:'10px'}}/>
            <button type='button' onClick={()=>selectNumberRows()}  style={{backgroundColor: "rgb(0, 135, 126)", color:'white', marginLeft:'5px'}}>Submit</button>
        </OverlayPanel>
    </>
       )
    }

    return (
        <div>
            <DataTable value={artwork} tableStyle={{ padding:"5rem" }} selectionMode={'multiple'}  onSelectionChange={(e) => setSelectRows(e.value)} paginator rows={rows} totalRecords={allRecords} lazy first={page * rows} loading={loading} onPage={pageEvent} selection={SelectRows}>
            <Column selectionMode="multiple" headerStyle={{ width: "3rem" }}></Column>
                <Column header={overlayPanel}></Column>
                <Column field='title' header="Title"></Column>
                <Column field='place_of_origin' header="Place of Origin"></Column>
                <Column field='artist_display' header="Artist Display"></Column>
                <Column field='inscriptions' header="inscription"></Column>
                <Column field='date_start' header="Date Start"></Column>
                <Column field='date_end' header="date End"></Column>
            </DataTable>
        </div>
    )
}

export default Table


