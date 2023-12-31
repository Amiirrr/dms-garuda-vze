import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux';

import ConfirmationLetter from "../../../../components/letter/confirmation-letter/letter_template/ConfirmationLetter"
import ConfirmationInputLetter from "../../../../components/letter/confirmation-letter/input_letter/InputLetter"
import ConfirmationInputRevisi from "../../../../components/letter/confirmation-letter/input_revisi/InputRevisi"
import { AsyncEditLetter, AsyncRevisiLetter, AsyncApproveLetter } from '../../../../state/confirm/middleware';
import api from '../../../../utils/api';

import { dataConfirmationLetter } from '../../../../utils/DummyData';

import Style from "./editLetter.module.css"

const EditConfirmationLetter = () => {
    const { auth = {} } = useSelector(states => states)
    const dispatch = useDispatch();

    const { id } = useParams();
    const [dataCL, setDataCL] = useState({})
    const [editDataCL, setEditDataCL] = useState({})
    const [showRevisiForm, setShowRevisiForm] = useState(false);
    const [revisi, setRevisi] = useState([])

    const cleanedRevisi = revisi.filter((value) => value !== undefined && value !== null && value.trim() !== null && value.trim() !== '');

    // const [dataCL, setDataCL] = useState(dataConfirmationLetter.find(item => item.id === id))
    async function getData(id) {
        try {
            const response = await api.GetDetailConfirmLetter(id);
            setDataCL(response.data.data);
            setRevisi(response.data.data.revisi)
            const updatedLetterData = {
                template_option: response.data.data.option || response.data.data.template_option || "Produk saja",
                nomor_surat: response.data.data.nomor_surat || "",
                nama_penerbit: response.data.data.nama_penerbit || "",
                tanggal_surat: response.data.data.tanggal_surat || "",
                perihal: response.data.data.perihal || "",
                media_ref: response.data.data.media_ref || "",
                tanggal_ref: response.data.data.tanggal_ref || "",
                jenis_permohonan: response.data.data.jenis_permohonan || "",
                catatan: response.data.data.catatan || "",
                nama_tertuju: response.data.data.nama_tertuju || "",
                jabatan: response.data.data.jabatan || "",
                nama_perusahaan: response.data.data.nama_perusahaan || "",
                alamat_perusahaan: response.data.data.alamat_perusahaan || "",
                category: response.data.data.category || "",
                sub_category: response.data.data.sub_category || "",
                jumlah_produk: response.data.data.jumlah_produk || "",
                kurs_USD: response.data.data.kurs_USD || "",
                produk_forms: response.data.data.produk_forms || [],
                total_biaya: response.data.data.total_biaya || "",
                jumlah_TNC: response.data.data.jumlah_TNC || "",
                TNC: response.data.data.TNC || [],
                konversi_kursUSD: response.data.data.konversi_kursUSD || "",
                nominal_terbilang: response.data.data.nominal_terbilang || "",
            };
            setEditDataCL(updatedLetterData);
        } catch (error) {
            console.error('Kesalahan mengambil data:', error);
        }
    }

    useEffect(() => {
        getData(id)
    }, [id])

    function editLetter() {
        dispatch(AsyncEditLetter(id, editDataCL))
    }

    function revisiLetter() {
        dispatch(AsyncRevisiLetter(id, cleanedRevisi))
    }

    const handleApprove = () => {
        dispatch(AsyncApproveLetter(id))
    }

    return (
        <div className='container' style={{ paddingBottom: "50px" }}>
            <div className={Style.CreateLetter}>
                <div className={Style.letterPreview}>
                    {Object.keys(editDataCL).length !== 0 ? (
                        <ConfirmationLetter data={editDataCL} />
                    ) : <p>loading...</p>}
                </div>
                <div style={{ width: "26%" }}>
                    <div className={Style.title}>
                        <h4>EDIT LETTER</h4>
                    </div>
                    <div className={Style.inputLetter}>
                        {Object.keys(editDataCL).length !== 0 ? (
                            <ConfirmationInputLetter
                                inputLetter={editDataCL}
                                setInputLetter={setEditDataCL}
                                editLetter={editLetter}
                            />
                        ) : <p>loading...</p>}
                    </div>
                </div>
                <div style={{ width: "26%" }}>
                    {
                        !showRevisiForm && revisi && revisi.length > 0 && (
                            <React.Fragment>
                                <div className={Style.title}>
                                    <h4>LIST REVISI</h4>
                                </div>
                                <div className={Style.card_list_revisi}>
                                    {
                                        revisi?.map((data, index) => (
                                            <ul>
                                                <li key={index}>{data}</li>
                                            </ul>
                                        ))
                                    }
                                </div>
                            </React.Fragment>
                        )
                    }
                    {
                        (dataCL.status === "submitted" && showRevisiForm === false && auth.role === 'PIC') && (
                            <Button type="button" className={`text-bg-danger ${Style.btnApprove}`}
                                onClick={() => setShowRevisiForm(!showRevisiForm)}
                            >
                                Need Revision
                            </Button>
                        )
                    }
                    {
                        showRevisiForm && (
                            <React.Fragment>
                                <div className={Style.inputRevisi}>
                                    <ConfirmationInputRevisi
                                        inputRevisi={revisi}
                                        setInputRevisi={setRevisi}
                                        revisiLetter={revisiLetter}
                                    />
                                </div>
                            </React.Fragment>
                        )
                    }
                    {
                        dataCL.status === "approved" && (
                            <Button type="button" className={`text-bg-danger ${Style.btnApprove}`}>
                                Print
                            </Button>
                        )
                    }
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                {
                    auth.role === 'PIC' && (
                        <Button type="button" className={`text-bg-success ${Style.btnApprove}`}
                            onClick={handleApprove}
                        >
                            Approve
                        </Button>
                    )
                }
            </div>
        </div>
    )
}

export default EditConfirmationLetter