import TableDashboad from '../table/tableDashboard/TableDashboad'
import Trend from './trend/Trend'
import style from "./dashboard.module.css"

const Index = () => {
    return (
        <div >
            <div className={style.trend}>
                <Trend />
            </div>
            <div className={style.tableDashboard}>
                <TableDashboad />
            </div>
        </div>
    )
}

export default Index