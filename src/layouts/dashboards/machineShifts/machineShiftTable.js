/* eslint-disable react/prop-types */
import DataTable from "components/Tables/DataTable"
import { memo } from "react"

const MachineShiftTable = memo(({ columns, rows }) => <DataTable
    table={{
        columns,
        rows
    }}
    entriesPerPage={{ defaultValue: 5 }}
    showTotalEntries={false}
/>)

export default MachineShiftTable