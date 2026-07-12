import "../styles/Audit.css";

export default function Audit() {

  const audits = [
    {
      asset: "AF-003 Dell Laptop",
      location: "Desk E12",
      status: "Verified",
    },
    {
      asset: "AF-921 Office Chair",
      location: "Desk E14",
      status: "Missing",
    },
    {
      asset: "AF-983 Monitor",
      location: "Desk E15",
      status: "Damaged",
    },
  ];

  return (
    <div className="audit-page">

      <h1>Asset Audit</h1>

      <div className="audit-info">

        <h3>Q3 Audit : Engineering Department (1 - 15 July)</h3>

        <p>
          Auditors : A. Rao, S. Iqbal
        </p>

      </div>

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Asset</th>
              <th>Expected Location</th>
              <th>Verification</th>
            </tr>

          </thead>

          <tbody>

            {audits.map((audit, index) => (

              <tr key={index}>

                <td>{audit.asset}</td>

                <td>{audit.location}</td>

                <td>

                  <span
                    className={`status ${audit.status.toLowerCase()}`}
                  >
                    {audit.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="audit-alert">

        2 Assets Flagged - Discrepancy Report Generated Automatically

      </div>

      <button className="success-btn">

        Close Audit Cycle

      </button>

    </div>
  );
}