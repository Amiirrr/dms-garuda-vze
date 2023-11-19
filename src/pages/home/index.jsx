import React from 'react'

import style from './home.module.css'

const Home = () => {
    return (
        <div className={style.homeWrapper}>
            <div className={`container ${style.homeContainer}`}>
                <div className={style.home}>
                    <span className={style.welcome}>
                        SELAMAT DATANG DI SISTEM MANAJEMEN DOKUMEN VZE
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Home