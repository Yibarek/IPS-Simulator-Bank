import React, { useState, useMemo, useEffect } from "react";
import axios from "axios"
import Select from "react-select";
import { selectStyles } from "../../../selectStyles";

export function open_Customer_Table() {
  document.getElementById("customer-table").style.display = "block";
}

export function close_Customer_Table() {
  document.getElementById("customer-table").style.display = "none";
}

const CustomerTable = () => {
  const ROWS_PER_PAGE = 50;

  const [data, setData] = useState([]);
  const [id, setId] = useState(null);
  const searchOptions = [
    { value: "AccountNo", label: "AccountNo" },
    { value: "FirstName", label: "FirstName" },
    { value: "Status", label: "Status" },
    { value: "Phone", label: "Phone" },
    { value: "Status", label: "Status" },
  ];

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.post("http://localhost:5000/queryCustomers");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [selectedRows, setSelectedRows] = useState([]);

  const [custId, setCustId] = useState([]);
  const [loading, setLoading] = useState([]);


  const queryCustById = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (custId) {
      try {
        const res = await axios.post("http://localhost:5000/queryCustByTd", 
          {custId}
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    else{
      try {
        const res = await axios.post("http://localhost:5000/queryCustomers");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  }
  
  // /* 🔹 Debounce search */
  // useEffect(() => {

  //   const timer = setTimeout(() => setDebouncedSearch(search), 300);
  //   return () => clearTimeout(timer);
  // }, [search]);

  // /* 🔹 Search */
  // const filteredData = useMemo(() => {
  //   return data.filter((row) =>
  //     Object.values(row).some((value) =>
  //       String(value).toLowerCase().includes(debouncedSearch.toLowerCase())
  //     )
  //   );
  // }, [data, debouncedSearch]);

  // /* 🔹 Sorting */
  // const sortedData = useMemo(() => {
  //   if (!sort.key) return filteredData;
  //   return [...filteredData].sort((a, b) => {
  //     const valA = a[sort.key];
  //     const valB = b[sort.key];
  //     if (valA < valB) return sort.direction === "asc" ? -1 : 1;
  //     if (valA > valB) return sort.direction === "asc" ? 1 : -1;
  //     return 0;
  //   });
  // }, [filteredData, sort]);

  // const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

  // const paginatedData = sortedData.slice(
  //   (page - 1) * ROWS_PER_PAGE,
  //   page * ROWS_PER_PAGE
  // );

  // /* 🔹 Selection */
  // const toggleRow = (id) =>
  //   setSelectedRows((prev) =>
  //     prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //   );

  // const toggleAll = () => {
  //   const ids = paginatedData.map((r) => r.id);
  //   setSelectedRows(
  //     ids.every((id) => selectedRows.includes(id))
  //       ? selectedRows.filter((id) => !ids.includes(id))
  //       : [...new Set([...selectedRows, ...ids])]
  //   );
  // };

  /* 🔹 CSV Export */
  // const exportCSV = () => {
  //   const rows = sortedData.map((row) => Object.values(row).join(","));
  //   const header = Object.keys(sortedData[0]).join(",");
  //   const csv = [header, ...rows].join("\n");

  //   const blob = new Blob([csv], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "table-data.csv";
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  // };

  const sortIcon = (key) =>
    sort.key === key ? (
      sort.direction === "asc" ? (
        <i className="bi bi-arrow-up ms-1"></i>
      ) : (
        <i className="bi bi-arrow-down ms-1"></i>
      )
    ) : null;

  const handleSort = (key) =>
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));

  return (
    <div className="container-fluid p-1" id="customer-table">
    <div className="form-panel p-1" >
      <h1 className="h3 fw-bold" style={{ color: "green", marginTop: "20px" }}>
              Customers
            </h1>
      {/* Search + Export */}
      <div className="d-flex justify-content-between align-items-center mb-2" style={{marginTop: "-25px", width: "100%"}}>
        {/* <button className="btn btn-outline-success export-btn" onClick={exportCSV}>
          <i className="bi bi-download me-1"></i> Export CSV
        </button> */}

        <div className="input-group" style={{ maxWidth: 320 }}>
          {/* <label htmlFor="TxId" style={{paddingBottom: "-20px"}}>
            Search by   
          </label> */}
          {/* <Select
            className="rounded-start-pill"
            id="TxId"
            options={searchOptions}
            value={searchOptions.find((option) => option.value === id)}
            onChange={(selectedCatagory) => setId(selectedCatagory.value)}
            defaultValue={searchOptions[0]}
            // isDisabled= {true}
            styles={selectStyles}
          /> */}
          <input
            className="form-control rounded-start-pill"
            placeholder="Account No..."
            style={{height: "30px", width: "160px"}}
            value={custId}
            onChange={(e) => {
              setCustId(e.target.value); 
            }}
          />
          <span className="input-group-text bg-white rounded-end-pill search-btn"
                style={{height: "30px"}}
                onClick={queryCustById}>
            <i className="bi bi-search"></i>
          </span>
        </div>
        <a href="#customer-table" style={{color: "#4f505eff"}}>Advanced Search <i className="bi bi-caret-down"></i></a>
      </div>

      {/* Table */}
      <div
        className="table-responsive border rounded"
        style={{ maxHeight: 570, overflow: "auto", fontSize: "14px"}}
      >
        <table className="mb-0" style={{width: "100%"}}>
          <thead  className="sticky-top"
                  // onMouseEnter={() => setHover(true)}
                  // onMouseLeave={() => setHover(false)} 
                  style={{color: "hsla(120, 86%, 19%, 1.00)", 
                          height:"30px", 
                          borderBottom: "2px solid var(--border-color)",
                          backgroundColor: "#cbdbcb"}}>
            <tr>
              <th style={{ height: "20px", color: "green" }}>
                <input
                  type="checkbox"
                  // onChange={toggleAll}
                  // checked={paginatedData.every((r) =>
                    // selectedRows.includes(r.id)
                  // )}
                />
              </th>
              {[
                "Id",
                "Name",
                "Status",
                "account",
                "currency",
                "balance",
                "phone",
                "email",
                "Created At",
              ].map((key) => (
                <th
                  key={key}
                  style={{ minWidth: 50, cursor: "pointer" }}
                  onClick={() => handleSort(key)}
                >
                  {key.toUpperCase()} {sortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(student => (
          <tr 
              key={student.key}
              className="hover-row"
              style={{height:"25px", 
                textAlign: "left",
                      borderBottom: "1px solid #f3f6f1ee",}}
          >
            <td style={{maxHeight: "10px", height:"10px"}}>
              <input type="checkbox" />
            </td>
            <td>
              {student["id"]}
            </td>
            <td>
              {student["full_name"]}
            </td>
            <td>
              {student["status"]}
            </td>
            <td>
              {student["account_no"]}
            </td>
            <td>
              { (student["currency"] == "230") ? "ETB" : student["currency"] }
            </td>
            <td>
              {student["balance"]}
            </td>
            <td>
              {student["phone"]}
            </td>
            <td>
              {student["email"]}
            </td>
            <td>
              {student["created_at"]}
            </td>
          </tr>
        )
      )}
          </tbody>
        </table>
      </div>

      {/* Pagination
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="text-muted">
          Selected: {selectedRows.length}
        </span>

        <ul className="pagination mb-0">
          <li className={`page-item ${page === 1 && "disabled"}`}>
            <button className="page-link" onClick={() => setPage(page - 1)}>
              Previous
            </button>
          </li>

          <li className="page-item active">
            <span className="page-link">{page}</span>
          </li>

          <li className={`page-item ${page === totalPages && "disabled"}`}>
            <button className="page-link" onClick={() => setPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div> */}
      {/* Pagination */}
<div className="d-flex justify-content-between align-items-center mt-3">
  {/* Info about rows and tables */}
  <div className="text-muted">
    Showing {data.length} of {data.length} rows | Total Tables: 1
  </div>

  {/* Page navigation */}
  <ul className="pagination mb-0">
    <li className={`page-item ${page === 1 && "disabled"}`}>
      <button className="page-link" onClick={() => setPage(page - 1)} style={{color:"green"}}>
        Previous
      </button>
    </li>

    <li className="page-item active">
      <span className="page-link"  style={{color: "#1a5a1dff", backgroundColor: "#a0e6a3ff", border: "1px solid #a0e6a3ff"}}>{page}</span>
    </li>

    {/* <li className={`page-item ${page === totalPages && "disabled"}`}> */}
      <button className="page-link" onClick={() => setPage(page + 1)} style={{color:"green"}}>
        Next
      </button>
    {/* </li> */}
  </ul>
</div>
    </div>
    </div>
  );
};

export default CustomerTable;
