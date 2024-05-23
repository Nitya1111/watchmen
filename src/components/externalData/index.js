import MDBox from "components/MDBox";
import MDCard from "components/MDCard";
import MDTypography from "components/MDTypography";
import DataTable from "components/Tables/DataTable";
import translate from "i18n/translate";
import PropTypes from "prop-types";

function ExternalData({ externDataColumns = [], externDataRows = [], canSearch = true }) {
  return (
    <MDCard sx={{ minHeight: "100px", boxShadow: "none", background: "transparent" }}>
      {/* <MDBox pl={2} lineHeight={1} sx={{ position: "absolute", top: "25px", zIndex: 1 }}>
        <MDTypography variant="button" fontWeight="bold" color="text" textTransform="capitalize">
          {translate("External data")}
        </MDTypography>
      </MDBox> */}
      {externDataRows?.length ? (
        <DataTable
          table={{
            columns: externDataColumns,
            rows: externDataRows
          }}
          entriesPerPage={false}
          canSearch={canSearch}
        />
      ) : (
        <MDBox sx={{ position: "absolute", top: "50px", width: "100%", textAlign: "center" }}>
          <MDTypography variant="h6" fontWeight="bold" color="text" textTransform="capitalize">
            {translate("No Entries Found")}
          </MDTypography>
        </MDBox>
      )}
    </MDCard>
  );
}

ExternalData.propTypes = {
  externDataColumns: PropTypes.arrayOf(
    PropTypes.shape({ header: PropTypes.string.isRequired, accessor: PropTypes.string.isRequired })
  ).isRequired,
  externDataRows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  canSearch: PropTypes.bool.isRequired
};

export default ExternalData;
