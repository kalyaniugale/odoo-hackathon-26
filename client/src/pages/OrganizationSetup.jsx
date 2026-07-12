import "./OrganizationSetup.css";

export default function OrganizationSetup() {
  const departments = [
    {
      department: "Engineering",
      head: "Aditi Rao",
      parent: "--",
      status: "Active",
    },
    {
      department: "Facilities",
      head: "Rohan Mehta",
      parent: "--",
      status: "Active",
    },
    {
      department: "Field Ops (East)",
      head: "Sana Iqbal",
      parent: "Field Ops",
      status: "Inactive",
    },
  ];

  return (
    <div className="org-page">

      <h2 className="page-title">
        Organization Setup
      </h2>

      <div className="org-top">

        <button className="tab active">
          Departments
        </button>

        <button className="tab">
          Categories
        </button>

        <button className="tab">
          Employees
        </button>

        <button className="success-btn">
          + Add
        </button>

      </div>

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Department</th>
              <th>Head</th>
              <th>Parent Department</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {departments.map((dept, index) => (
              <tr key={index}>

                <td>{dept.department}</td>

                <td>{dept.head}</td>

                <td>{dept.parent}</td>

                <td>
                  <span
                    className={
                      dept.status === "Active"
                        ? "status active"
                        : "status inactive"
                    }
                  >
                    {dept.status}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      <div className="note">
        Editing a department here automatically updates the department
        dropdowns used in Assets and Allocation & Transfer modules.
      </div>

    </div>
  );
}