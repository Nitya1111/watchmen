import loader from "../../assets/images/loader.gif";

function Loader() {
  return (
    <div className="loader-overlay">
      <img style={{ width: "55px", height: "55px" }} src={loader} alt="loading" />
    </div>
  );
}

export default Loader;
