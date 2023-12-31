import React from 'react'
import { useEffect, useState } from 'react'
import { Form, InputGroup, Button, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'

import { formatDateToLetterNumber } from '../../../tools/FormatDate'
import Products from "../../../../utils/Product.json"
import InputFile from '../../../tools/inputFile'
import Terbilang from '../../../tools/Terbilang'

import Style from "./inputLetter.module.css"

const InputConfirmationLetter = ({ inputLetter, setInputLetter, isUpload, getData, editLetter }) => {
    const { auth = {} } = useSelector(states => states)

    const [typeDurasi, setTypeDurasi] = useState([]);
    const [inputDurasi, setInputDurasi] = useState('');
    const [file, setFile] = useState(null);
    const [isDisabled, setIsDisabled] = useState((editLetter && (auth.role !== 'Admin' && auth.role !== 'Sysadmin')) ? true : false);

    const productCode = Products.categories.find((cat) => cat.name === inputLetter.category)
        ?.subcategories.find((subCat) => subCat.name === inputLetter.sub_category)?.code

    const dateLetter = formatDateToLetterNumber(inputLetter.tanggal_surat)
    useEffect(() => {
        if (!isUpload && inputLetter.tanggal_surat && productCode) {
            setInputLetter({ ...inputLetter, nomor_surat: `CL${productCode}-20015-${dateLetter}` });
        }
    }, [inputLetter.nomor_surat, productCode, dateLetter, isUpload])

    useEffect(() => {
        updateTotalBiaya();
    }, [inputLetter.kurs_USD, inputLetter.konversi_kursUSD]);

    const handleProdukFormsChange = (index, prop, value) => {
        setInputLetter((prevInputLetter) => {
            const newForms = [...prevInputLetter.produk_forms];
            newForms[index][prop] = value;

            return {
                ...prevInputLetter,
                produk_forms: newForms,
            };
        });
        updateTotalBiaya()
    };

    const updateTotalBiaya = () => {
        const kursUSD = inputLetter.konversi_kursUSD === "Ya" ? inputLetter.kurs_USD : 1;

        const updatedProdukForms = inputLetter.produk_forms.map((produkForm, index) => {
            let totalBiayaKegiatan = 0;

            if (inputLetter.template_option === "Produk saja") {
                totalBiayaKegiatan =
                    produkForm.biaya *
                    kursUSD *
                    produkForm.jumlah_peserta *
                    parseInt(produkForm.durasi.split(' ')[0], 10);
            } else if (inputLetter.template_option === "Produk + Meals") {
                totalBiayaKegiatan =
                    produkForm.biaya *
                    kursUSD *
                    produkForm.jumlah_peserta *
                    parseInt(produkForm.durasi.split(' ')[0], 10) +
                    produkForm.total_biaya_meals;
            } else if (inputLetter.template_option === "Produk - Meals") {
                totalBiayaKegiatan =
                    produkForm.biaya *
                    kursUSD *
                    produkForm.jumlah_peserta *
                    parseInt(produkForm.durasi.split(' ')[0], 10) -
                    produkForm.total_biaya_meals;
            }

            const totalBiayaMeals =
                inputLetter.template_option === "Produk + Meals" || inputLetter.template_option === "Produk - Meals"
                    ? produkForm.biaya_meal * kursUSD * produkForm.jumlah_peserta
                    : 0;

            return {
                ...produkForm,
                total_biaya_meals: totalBiayaMeals,
                total_biaya_kegiatan: totalBiayaKegiatan,
                nominal_terbilang: Terbilang(totalBiayaKegiatan)
            };
        });

        const totalBiayaKeseluruhan = updatedProdukForms.reduce(
            (total, produkForm) => total + produkForm.total_biaya_kegiatan,
            0
        );

        setInputLetter((prevData) => ({
            ...prevData,
            produk_forms: updatedProdukForms,
            total_biaya: totalBiayaKeseluruhan,
            nominal_terbilang: Terbilang(totalBiayaKeseluruhan)
        }));
    };

    const handleDurasiChange = (index, value) => {
        setTypeDurasi((prevTypeDurasi) => {
            const newTypeDurasi = [...prevTypeDurasi];
            newTypeDurasi[index] = value;
            return newTypeDurasi;
        });
    };

    const handleJumlahProdukChange = (e) => {
        const newValue = parseInt(e.target.value, 10 || 1);
        setInputLetter((prevInputLetter) => ({
            ...prevInputLetter,
            jumlah_produk: newValue,
            produk_forms: Array.from({ length: newValue }, (_, index) => prevInputLetter.produk_forms[index] || {
                jenis_kegiatan: '',
                tanggal_kegiatan: '',
                jumlah_peserta: '',
                biaya_meal: '',
                biaya: '',
                total_biaya_meals: "",
                total_biaya_kegiatan: "",
                durasi: '',
            }),
        }));
    };

    const handleJumlahTNCChange = (e) => {
        const newValue = parseInt(e.target.value, 10 || 1);
        setInputLetter((prevInputLetter) => ({
            ...prevInputLetter,
            jumlah_TNC: newValue,
            TNC: Array.from({ length: newValue }, (_, index) => prevInputLetter.TNC[index] || {
                detail: ''
            }),
        }));
    };

    const handleTNCChange = (index, prop, value) => {
        setInputLetter((prevInputLetter) => {
            const newForms = [...prevInputLetter.TNC];
            newForms[index][prop] = value;
            return {
                ...prevInputLetter,
                TNC: newForms,
            };
        });
    };

    const renderTNC = () => {
        return inputLetter.TNC.map((tnc, index) => (
            <Form.Group key={index} controlId={`TNC-${index}`} className="mb-2">
                <Form.Label>Term n Condition ke-{index + 1}</Form.Label>
                <Form.Control type="text" size='md'
                    disabled={isDisabled}
                    value={tnc.detail}
                    onChange={(e) => handleTNCChange(index, 'detail', e.target.value)}
                />
            </Form.Group>
        ));
    }

    const renderProdukForms = () => {
        return inputLetter.produk_forms.map((form, index) => (
            <Form.Group key={index} controlId="kegiatan" className="mb-2">
                <p style={{ fontWeight: "bold" }}>Kegiatan ke-{index + 1}</p>
                <Form.Group controlId={`jenisKegiatan-${index}`} className="mb-2">
                    <Form.Label>Jenis Kegiatan</Form.Label>
                    <Form.Control type="text" size='md'
                        disabled={isDisabled}
                        value={form.jenis_kegiatan}
                        onChange={(e) => handleProdukFormsChange(index, 'jenis_kegiatan', e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId={`tanggalKegiatan-${index}`} className="mb-2">
                    <Form.Label>Tanggal Kegiatan</Form.Label>
                    <Form.Control type="date" size='md'
                        disabled={isDisabled}
                        value={form.tanggal_kegiatan}
                        onChange={(e) => handleProdukFormsChange(index, 'tanggal_kegiatan', e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId={`jumlahPeserta-${index}`} className="mb-2">
                    <Form.Label>Jumlah Peserta</Form.Label>
                    <Form.Control type="number" size='md'
                        disabled={isDisabled}
                        value={form.jumlah_peserta}
                        onChange={(e) => handleProdukFormsChange(index, 'jumlah_peserta', e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-2">
                    <Form.Label>Durasi</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control type="number" size='sm'
                            disabled={isDisabled}
                            value={form.durasi.match(/\d+/)}
                            onChange={(e) => {
                                setInputDurasi(e.target.value)
                                const input = e.target.value;
                                if (input) {
                                    handleProdukFormsChange(index, 'durasi', input + ' ' + typeDurasi[index]);
                                }
                            }
                            }
                        />
                        <Form.Select
                            value={form.durasi.split(' ')[1]}
                            disabled={isDisabled}
                            onChange={(e) => {
                                handleDurasiChange(index, e.target.value)
                                const input = e.target.value;
                                if (input) {
                                    handleProdukFormsChange(index, 'durasi', inputDurasi + ' ' + input);
                                }
                            }} >
                            <option>choose</option>
                            <option>jam</option>
                            <option>hari</option>
                            <option>sesi</option>
                        </Form.Select>
                    </InputGroup>
                </Form.Group>

                {
                    inputLetter.template_option !== "Produk saja" && (
                        <Form.Group controlId={`biayaMeal-${index}`} className="mb-2">
                            <Form.Label>Biaya Meal</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text id="basic-addon1">USD</InputGroup.Text>
                                <Form.Control type="number" size='sm'
                                    disabled={isDisabled}
                                    value={form.biaya_meal}
                                    onChange={(e) => handleProdukFormsChange(index, 'biaya_meal', e.target.value)}
                                />
                            </InputGroup>
                        </Form.Group>
                    )
                }

                <Form.Group controlId={`biaya-${index}`} className="mb-2">
                    <Form.Label>Biaya</Form.Label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">{inputLetter.konversi_kursUSD === "Ya" ? "USD" : "Rp"}</InputGroup.Text>
                        <Form.Control type="number" size='sm'
                            disabled={isDisabled}
                            value={form.biaya}
                            onChange={(e) => handleProdukFormsChange(index, 'biaya', e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>
            </Form.Group >
        ));
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!file && !editLetter) {
            getData()
        }
        if (editLetter) {
            editLetter()
        }
        if (file) {
            getData()
        }
    }

    useEffect(() => {
        if (file) {
            setInputLetter({ ...inputLetter, file: file.file })
        }
    }, [file])

    return (
        <div className={Style.inputLetter}>
            <Form className={Style.formInputLetter} onSubmit={handleSubmit}>
                <Form.Group controlId="template" className="mb-2" >
                    <Form.Label style={{ fontWeight: "bold" }}>Pilih Template Surat</Form.Label>
                    <Form.Select
                        disabled={isDisabled}
                        required
                        value={inputLetter.template_option}
                        onChange={(e) => { setInputLetter({ ...inputLetter, template_option: e.target.value }) }}
                    >
                        <option>Produk saja</option>
                        {/* <option>Produk + Meals</option>
                        <option>Produk - Meals</option> */}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="infromasiSurat" className="mb-2">
                    <p style={{ fontWeight: "bold" }}>Informasi Surat</p>

                    {
                        isUpload && (<Form.Group controlId="nomor_surat" className="mb-2">
                            <Form.Label>Nomor Surat</Form.Label>
                            <Form.Control type="text" size='sm'
                                disabled={isDisabled}
                                value={inputLetter.nomor_surat}
                                onChange={(e) => { setInputLetter({ ...inputLetter, nomor_surat: e.target.value }) }}
                            />
                        </Form.Group>)
                    }

                    <Form.Group controlId="namaPenerbit" className="mb-2">
                        <Form.Label>Nama Penanda Tangan</Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            required
                            placeholder='ex: Vonny Franciska Pinontoan'
                            type="text" size='sm'
                            value={inputLetter.nama_penerbit}
                            onChange={(e) => { setInputLetter({ ...inputLetter, nama_penerbit: e.target.value }) }} />
                    </Form.Group>
                    <Form.Group controlId="tanggal_surat" className="mb-2">
                        <Form.Label>Tanggal Surat</Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            required
                            type="date"
                            size='sm'
                            value={inputLetter.tanggal_surat}
                            onChange={(e) => { setInputLetter({ ...inputLetter, tanggal_surat: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="subject" className="mb-2">
                        <Form.Label>Subject/Perihal</Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            required
                            type="text"
                            size='sm'
                            value={inputLetter.perihal}
                            onChange={(e) => { setInputLetter({ ...inputLetter, perihal: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="mediaReferensi" className="mb-2">
                        <Form.Label>Media Referensi</Form.Label>
                        <Form.Control
                            disabled={isDisabled}
                            required
                            type="text"
                            size='sm'
                            value={inputLetter.media_ref}
                            onChange={(e) => { setInputLetter({ ...inputLetter, media_ref: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="tanggalReferensi" className="mb-2">
                        <Form.Label>Tanggal Referensi</Form.Label>
                        <Form.Control type="date" size='md'
                            disabled={isDisabled}
                            required
                            value={inputLetter.tanggal_ref}
                            onChange={(e) => { setInputLetter({ ...inputLetter, tanggal_ref: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="jenisPermohonan" className="mb-2">
                        <Form.Label>Jenis Permohonan</Form.Label>
                        <Form.Control type="text" size='sm'
                            disabled={isDisabled}
                            value={inputLetter.jenis_permohonan}
                            onChange={(e) => { setInputLetter({ ...inputLetter, jenis_permohonan: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="catatan" className="mb-2">
                        <Form.Label>Catatan <span style={{ fontSize: "12px", color: "#9D9D9D" }}>*optional</span></Form.Label>
                        <Form.Control as="textarea" size='sm' rows={3}
                            disabled={isDisabled}
                            value={inputLetter.catatan}
                            onChange={(e) => { setInputLetter({ ...inputLetter, catatan: e.target.value }) }}
                        // onChange={(e) => handleChange("catatan", e.target.value)}
                        />
                    </Form.Group>
                </Form.Group>

                <Form.Group controlId="informasiCustomer" className="mb-2">
                    <p style={{ fontWeight: "bold" }}>Informasi Customer</p>
                    <Form.Group controlId="namaTertuju" className="mb-2">
                        <Form.Label>Nama Tertuju</Form.Label>
                        <Form.Control type="text" size='sm'
                            disabled={isDisabled}
                            required
                            placeholder='ex: Ibu Vonny Franciska Pinontoan'
                            value={inputLetter.nama_tertuju}
                            onChange={(e) => { setInputLetter({ ...inputLetter, nama_tertuju: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="jabatan" className="mb-2">
                        <Form.Label>Jabatan</Form.Label>
                        <Form.Control type="text" size='sm'
                            disabled={isDisabled}
                            required
                            value={inputLetter.jabatan}
                            onChange={(e) => { setInputLetter({ ...inputLetter, jabatan: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="namaPerusahaan" className="mb-2">
                        <Form.Label>Nama Perusahaan</Form.Label>
                        <Form.Control type="text" size='sm'
                            disabled={isDisabled}
                            required
                            value={inputLetter.nama_perusahaan}
                            onChange={(e) => { setInputLetter({ ...inputLetter, nama_perusahaan: e.target.value }) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="alamatPerusahaan" className="mb-2">
                        <Form.Label>Alamat Perusahaan</Form.Label>
                        <Form.Control as="textarea" size='sm'
                            disabled={isDisabled}
                            required
                            value={inputLetter.alamat_perusahaan}
                            onChange={(e) => { setInputLetter({ ...inputLetter, alamat_perusahaan: e.target.value }) }}
                        />
                    </Form.Group>
                </Form.Group>

                <Form.Group controlId="informasiProduk" className="mb-2">
                    <p style={{ fontWeight: "bold" }}>Informasi Produk</p>
                    <Form.Group controlId="kategoriProduk" className="mb-2">
                        <Form.Label>Kategori Produk</Form.Label>
                        <Form.Select aria-label="Default select example" size='md'
                            disabled={isDisabled}
                            required
                            value={inputLetter.category}
                            onChange={(e) => { setInputLetter({ ...inputLetter, category: e.target.value }) }}
                        >
                            <option>Open this select menu</option>
                            {
                                Products.categories.map((cat) => (
                                    <option key={cat.code}>{cat.name}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="subCategory" className="mb-2">
                        <Form.Label>Jenis Sub-Produk</Form.Label>
                        <Form.Select aria-label="Default select example" size='md'
                            disabled={isDisabled}
                            required
                            value={inputLetter.sub_category}
                            onChange={(e) => { setInputLetter({ ...inputLetter, sub_category: e.target.value }) }}
                        >
                            <option>Open this select menu</option>
                            {
                                Products.categories.find(cat => cat.name === inputLetter.category)?.subcategories.map((subCat, index) => (
                                    <option key={index}>{subCat.name}</option>
                                ))
                            }
                        </Form.Select>
                    </Form.Group>
                    {/* Jumlah Produk */}
                    <Form.Group controlId="jumlahProduk" className="mb-3">
                        <Form.Label>Jumlah Produk</Form.Label>
                        <Form.Select aria-label="Default select example" size='md'
                            disabled={isDisabled}
                            required
                            value={inputLetter.jumlah_produk}
                            onChange={handleJumlahProdukChange}
                        >
                            {Array.from({ length: 10 }).map((_, index) => (
                                <option key={index + 1}>{index + 1}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
                        <Form.Label column sm="6">
                            Konversi Kurs USD
                        </Form.Label>
                        <Col sm="6">
                            <Form.Select
                                disabled={isDisabled}
                                required
                                value={inputLetter.konversi_kursUSD}
                                onChange={(e) => { setInputLetter({ ...inputLetter, konversi_kursUSD: e.target.value }) }}
                            >
                                <option>Tidak</option>
                                <option>Ya</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    {/* Kurs USD */}

                    {
                        inputLetter.konversi_kursUSD === "Ya" && (
                            <Form.Group controlId={`kurs_USD`} className="mb-2" >
                                <Form.Label>Kurs USD</Form.Label>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1">Rp</InputGroup.Text>
                                    <Form.Control type="number" size='sm'
                                        disabled={isDisabled}
                                        required
                                        value={inputLetter.kurs_USD}
                                        onChange={(e) => {
                                            setInputLetter({ ...inputLetter, kurs_USD: e.target.value })
                                        }}
                                    />
                                </InputGroup>
                            </Form.Group >
                        )
                    }
                </Form.Group>

                <Form.Group controlId="informasiKegiatan" className="mb-2">
                    <p style={{ fontWeight: "bold" }}>Informasi Kegiatan</p>
                    {renderProdukForms()}
                </Form.Group>
                <Form.Group controlId="informasiTnC" className="mb-2">
                    <p style={{ fontWeight: "bold" }}>Informasi Term n Condition</p>
                    <Form.Group controlId="jumlahTnC" className="mb-2">
                        <Form.Label>Jumlah Term n Condition</Form.Label>
                        <Form.Select aria-label="Default select example" size='md'
                            disabled={isDisabled}
                            value={inputLetter.jumlah_TNC}
                            onChange={handleJumlahTNCChange}
                        >
                            {Array.from({ length: 5 }).map((_, index) => (
                                <option key={index + 1}>{index + 1}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {renderTNC()}

                </Form.Group>
                {
                    isUpload && (
                        <Form.Group controlId="upload" className="mb-2">
                            <p style={{ fontWeight: "bold" }}>Upload Dokumen</p>
                            <InputFile getData={setFile} />
                        </Form.Group>
                    )
                }
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {
                        (((auth.role === 'Admin' || auth.role === 'Sysadmin') && editLetter) || !editLetter) && (
                            <Button type="submit" className={Style.btnSubmit} >
                                Submit
                            </Button>
                        )
                    }
                </div>
            </Form>
        </div>
    )
}

export default InputConfirmationLetter
