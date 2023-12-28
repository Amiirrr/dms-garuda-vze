import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { AsyncGetConfirms } from '../../../state/confirm/middleware'
import { AsyncGetOfferings } from '../../../state/offering/middleware'

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";

import { formatDate } from '../../tools/FormatDate';
import api from '../../../utils/api';

import ModalUploadFile from '../../modal/upload_file/ModalUploadFile';

// import { dataConfirmationLetter, offeringLetterData } from '../../../utils/DummyData';

import style from './tableLetter.module.css'

const TableLetter = () => {
    const { confirms = [], offers = [] } = useSelector(states => states)
    const dispatch = useDispatch()


    const navigate = useNavigate();
    // const [data, setData] = useState([])
    const [letterOption, setLetterOption] = useState("Confirmation Letter")
    const [filters, setFilters] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [dropdown, setDropdown] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedData, setSelectedData] = useState([]);
    // const [loading, setLoading] = useState(false);
    // const [showCreateForm, setShowCreateForm] = useState(false);
    // const [showUploadForm, setShowUploadForm] = useState(false);

    const typeLetterData = letterOption.toLowerCase().replace(/\s+/g, '-');
    const letter = ["Confirmation Letter", "Offering Letter"];

    //letter option
    const handleOptionClick = (option) => {
        setLetterOption(option);
        // navigate(`/status/${typeLetterData.toLowerCase().replace(/\s+/g, '-')}`);
        setDropdown(false);
        // setLoading()
    };

    async function getData(id) {
        try {
            const response = await api.ViewUploadLetter(id);
            const url = response.data.url
            window.open(url, '_blank');
        } catch (error) {
            console.error('Kesalahan mengambil data:', error);
        }
    }


    //getData
    useEffect(() => {
        if (letterOption === "Confirmation Letter") {
            dispatch(AsyncGetConfirms(1))
            // setData(dataConfirmationLetter);
        } else if (letterOption === "Offering Letter") {
            dispatch(AsyncGetOfferings(1))
            // setData(offeringLetterData)
        }
        initFilters();
    }, [dispatch, letterOption])

    const handleUploadClick = () => {
        letterOption === "Confirmation Letter"
            ? navigate(`/upload/confirmation-letter`)
            : letterOption === "Offering Letter"
                ? navigate(`/upload/offering-letter`)
                : null;
    };

    const handleCreateClick = () => {
        letterOption === "Confirmation Letter"
            ? navigate(`/create/confirmation-letter`)
            : letterOption === "Offering Letter"
                ? navigate(`/create/offering-letter`)
                : null;
    };

    const handleViewClick = (id) => {
        letterOption === "Confirmation Letter"
            ? navigate(`/view/confirmation-letter/${id}`)
            : letterOption === "Offering Letter"
                ? navigate(`/view/offering-letter/${id}`)
                : null;
    };

    const handleEditClick = (id) => {
        console.log(id)
        letterOption === "Confirmation Letter"
            ? navigate(`/edit/confirmation-letter/${id}`)
            : letterOption === "Offering Letter"
                ? navigate(`/edit/offering-letter/${id}`)
                : null;
    };

    //onChange Global Filter
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilterValue(value);
        setTimeout(() => {
            let _filters = { ...filters };
            _filters["global"].value = value;
            setFilters(_filters);
        }, 500);
    };

    //action global filter in library primeReact
    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        setGlobalFilterValue("");
    };

    //column template in library primeReact
    //header template in library primeReact
    const renderHeader = () => {
        return (
            <div className={style.header}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <span className={style.letterName}>{letterOption.toUpperCase()}</span>
                    <div>
                        <i
                            onClick={() => { setDropdown(!dropdown) }}
                            className={`pi ${dropdown ? 'pi-chevron-up' : 'pi-chevron-down'}`}
                            style={{ cursor: "pointer" }}
                        />
                        {
                            dropdown === true && (
                                <div className={style.dropdown}>
                                    {letter.map((option) => (
                                        <span
                                            key={option}
                                            style={{ padding: "15px", cursor: "pointer" }}
                                            onClick={() => handleOptionClick(option)}
                                        >
                                            {option}
                                        </span>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "30px", }}>
                    <button className={`btn`} style={{ backgroundColor: "#9D9D9D" }}
                        onClick={handleUploadClick}
                    >Upload</button>
                    <button className={`btn`} style={{ backgroundColor: "#164391" }}
                        onClick={handleCreateClick}
                    >Create</button>
                    <span className="p-input-icon-left " style={{ display: "flex", justifyContent: "center" }}>
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Keyword Search"
                            style={{ display: "flex", justifyContent: "center" }}
                        />
                    </span>
                </div>
            </div>
        );
    };

    //status column template in library primeReact
    const statusBodyTemplate = (rowData) => {
        switch (rowData.status) {
            case "done":
                return <span className='status text-bg-light'>DONE!</span>;
            case "approved":
                return <span className='status text-bg-success'>Disetujui</span>;
            case "submitted":
                return <span className='status text-bg-warning'>Belum disetujui</span>;
            case "need revision":
                return <span className='status text-bg-danger'>Revisi</span>;
            default:
                return null;
        }
    }

    const nameBodyTemplate = (rowData) => {
        const nama = rowData.nama_tertuju.split(' ').slice(1).join(' ')

        return (
            <p>{nama}</p>
        )
    }
    const dateBodyTemplate = (rowData) => {
        const date = formatDate(rowData.tanggal_surat)
        return (
            <p>{date}</p>
        )
    }

    //upload column template in library primeReact
    const uploadScanBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {
                    rowData.status === "done" ? (
                        <i className="pi pi-eye" style={{ cursor: "pointer" }}
                            // onClick={() => navigate(`/view/upload-dokumen/${rowData._id}`)}
                            onClick={() => getData(rowData.drive_id)}
                        />)
                        : rowData.status === "approved" ?
                            (<i className="pi pi-upload" style={{ cursor: "pointer" }} onClick={() => {
                                setShowUploadModal(true)
                                setSelectedData(rowData)
                            }} />)
                            : (<span>-</span>)
                }
            </React.Fragment>
        )
    }

    //document column template in library primeReact
    const documentBodyTemplate = (rowData) => {
        // console.log(rowData._id)
        return (
            <React.Fragment>
                {
                    rowData.status === "submitted" || rowData.status === "need revision" ? (
                        <i className="pi pi-file-edit" style={{ cursor: "pointer" }}
                            onClick={() => handleEditClick(rowData._id)}
                        />)
                        : rowData.dokumen === null ?
                            (<span>-</span>)
                            :
                            (<i className="pi pi-file" style={{ cursor: "pointer" }}
                                onClick={() => handleViewClick(rowData._id)}
                            />)
                }
            </React.Fragment>
        )
    }

    return (
        <div>
            <div className={style.tableLetter}>
                <DataTable
                    value={letterOption === 'Confirmation Letter' ? confirms : offers}
                    showGridlines
                    removableSort
                    scrollable scrollHeight="650px" sortField="tanggal" sortOrder={-1}
                    paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
                    tableStyle={{ minWidth: '50rem', borderRight: " 1px solid #e9ecef", borderLeft: " 1px solid #e9ecef" }}
                    dataKey="id"
                    id='id'
                    header={renderHeader()}
                    filters={filters} globalFilterFields={['id', 'nama_tertuju', 'tanggal_surat', 'nama_perusahaan', 'dokumen', 'status']}
                >
                    <Column
                        field="id"
                        header="No"
                        headerStyle={{ borderBottom: "1px solid #000", display: "flex", justifyContent: "center" }}
                        body={(data, e) => e.rowIndex + 1}
                        style={{ textAlign: "center" }} />
                    <Column
                        field="nama_tertuju"
                        header="Nama"
                        sortable
                        headerStyle={{ borderBottom: "1px solid #000", }}
                        body={nameBodyTemplate} />
                    <Column
                        field="tanggal_surat"
                        header="Tanggal"
                        sortable
                        headerStyle={{ borderBottom: "1px solid #000" }}
                        body={dateBodyTemplate} />
                    <Column
                        field="nama_perusahaan"
                        header="Customer"
                        sortable
                        headerStyle={{ borderBottom: "1px solid #000" }} />
                    <Column
                        field="status"
                        header="Status"
                        sortable
                        headerStyle={{ borderBottom: "1px solid #000" }}
                        body={statusBodyTemplate} />
                    <Column
                        header=""
                        headerStyle={{ borderBottom: "1px solid #000" }}
                        body={uploadScanBodyTemplate}
                        style={{ textAlign: "center" }} />
                    <Column
                        field=""
                        header="Doc"
                        headerStyle={{ borderBottom: "1px solid #000", display: "flex", justifyContent: "center" }}
                        body={documentBodyTemplate}
                        style={{ textAlign: "center" }} />
                </DataTable>
                {
                    showUploadModal && (
                        <ModalUploadFile
                            show={showUploadModal}
                            setShow={setShowUploadModal}
                            data={selectedData}
                            letter={letterOption === 'Confirmation Letter' ? "confirm" : "offers"}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default TableLetter