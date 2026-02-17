import React, { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export function open_TransactionTable() {
  document.getElementById("transactionTable").display = "block"
}
export function close_TransactionTable() {
  document.getElementById("transactionTable").display = "block"
}


const TransactionTable = () => {
  const ROWS_PER_PAGE = 100;

  // Generate 1000 rows
  // const data = useMemo(
  //   () =>
  //     Array.from({ length: 1000 }, (_, i) => ({
  //       id: i + 1,
  //       firstName: `First ${i + 1}`,
  //       lastName: `Last ${i + 1}`,
  //       email: `user${i + 1}@example.com`,
  //       phone: `+1-555-${String(i).padStart(4, "0")}`,
  //       department: i % 2 === 0 ? "Engineering" : "HR",
  //       role: i % 3 === 0 ? "Admin" : "User",
  //       status: i % 2 === 0 ? "Active" : "Inactive",
  //       country: "USA",
  //       createdAt: `2024-01-${(i % 28) + 1}`,
  //     })),
  //   []
  // );

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.post("http://localhost:5000/fetch_TxnRecord");
      setData(res.data || []);
      // console.log(res.data.message); 
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
  const [hover, setHover] = useState([]);
  
  const queryTxnById = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (id) {
      try {
        const res = await axios.post("http://localhost:5000/fetchTxnById", 
          {id}
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    else{
      try {
        const res = await axios.post("http://localhost:5000/fetch_TxnRecord");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  }

  /* 🔹 Debounce search */
  // useEffect(() => {

  //   const timer = setTimeout(() => setDebouncedSearch(search), 300);
  //   return () => clearTimeout(timer);
  // }, [search]);

  /* 🔹 Search */
  // const filteredData = useMemo(() => {
  //   return data.filter((row) =>
  //     Object.values(row).some((value) =>
  //       String(value).toLowerCase().includes(debouncedSearch.toLowerCase())
  //     )
  //   );
  // }, [data, debouncedSearch]);

  /* 🔹 Sorting */
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

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);

  let paginatedData = ''
  if (data.message == "Database Query Error : Error: Can't add new command when connection is in closed state") {
    paginatedData = data
  }
  paginatedData = data.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  /* 🔹 Selection */
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

  // const handleSort = (key) =>
  //   setSort((prev) => ({
  //     key,
  //     direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
  //   }));

  return (
    <div className="container-fluid p-1"
          id = "transactionTable">
      <br/>
      {/* Search + Export */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* <button className="btn btn-outline-success export-btn" onClick={exportCSV}>
          <i className="bi bi-download me-1"></i> Export CSV
        </button> */}

        <div className="input-group p-0"  style={{ maxWidth: 320 }}>
          <input 
            className="form-control rounded-start-pill"
            style={{height: "30px"}}
            placeholder="Transaction Id..."
            value={id}
            onChange={(e) => {
              setId(e.target.value); 
            }}
          /> 
          <div className="input-group-text bg-white rounded-end-pill search-btn"
                style={{height: "30px", backgroundColor: "green"}}
                onClick={queryTxnById}>
            <i className="bi bi-search "></i>
          </div>
        </div>
        <h1 className="h3 fw-bold mb-2" style={{textAlign:"center", color: "green" }}>
              Transactions
        </h1>
        <h1> </h1>
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
                  //   selectedRows.includes(r.id)
                  // )}
                />
              </th>
              {[
                "Transaction Id",
                "Type",
                "Status",
                // "Initiator",
                "Debitor",
                "Creditor",
                "Amount",
                "Currency",
                "Channel",
                "Created At",
                "Updated at",
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
            {paginatedData.map(student => (
          <tr 
              key={student.key}
              className="hover-row"
              style={{height:"25px",
                textAlign: "left" ,
                maxHeight: "30px" ,
                      borderBottom: "1px solid #f1f1f1ee",}}
          >
            <td style={{maxHeight: "10px", height:"10px"}}>
              <input type="checkbox" />
            </td>
            <td>
              {student["transaction_id"]}
            </td>
            <td>
              {student["transaction_type"]}
            </td>
            <td>
              {student["status"]}
            </td>
            {/* <td>
              {student["initiator_bank"]}   
            </td> */}
            <td>
              {student["debtor_bank"]}
            </td>
            <td>
              {student["creditor_bank"]}
            </td>
            <td>
              {student["total_amount"]}
            </td>
            <td>
              {student["currency"]}
            </td>
            <td>
              {student["channel"]}
            </td>
            <td>
              {student["transaction_time"]}
            </td>
            <td>
              {student["updated_at"]}
            </td>
          </tr>
        )
      )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
<div className="d-flex justify-content-between align-items-center mt-3">
  {/* Info about rows and tables */}
  <div className="text-muted">
    Showing {paginatedData.length} of {data.length} rows | Total Tables: 1
  </div>

  {/* Page navigation */}
  <ul className="pagination mb-0 sticky-bottom">
    <li className={`page-item ${page === 1 && "disabled"}`}>
      <button className="page-link" onClick={() => setPage(page - 1)} style={{color:"green"}}>
        Previous
      </button>
    </li>

    <li className="page-item active" style={{backgroundColor: "#a0e6a3ff"}}>
      <span className="page-link" style={{color: "#1a5a1dff", backgroundColor: "#a0e6a3ff", border: "1px solid #a0e6a3ff"}}>{page}</span>
    </li>

    <li className={`page-item ${page === totalPages && "disabled"}`}>
      <button className="page-link" onClick={() => setPage(page + 1)} style={{color:"green"}}>
        Next
      </button>
    </li>
  </ul>
</div>
    </div>
  );
};

export default TransactionTable;
