import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  FolderTree,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import authClient from "../services/authService";
import "./OrganizationSetup.css";

const TABS = [
  { key: "departments", label: "Departments", icon: FolderTree },
  { key: "categories", label: "Categories", icon: Tag },
  { key: "employees", label: "Employees", icon: Users },
];

const STATUS_OPTIONS = ["Active", "Inactive"];
const EMPLOYEE_PROMOTION_ROLES = ["Department Head", "Asset Manager"];

const getName = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.email || "-";
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const matchesSearch = (item, query, fields) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return true;

  return fields.some((field) => {
    const value = field(item);
    return String(value || "").toLowerCase().includes(normalizedQuery);
  });
};

function StatusBadge({ status }) {
  return (
    <span
      className={`org-status ${
        status === "Active" ? "org-status--active" : "org-status--inactive"
      }`}
    >
      {status}
    </span>
  );
}

function ConfirmationModal({ target, onCancel, onConfirm, submitting }) {
  if (!target) return null;

  return (
    <div className="org-modal-backdrop" role="presentation">
      <section className="org-confirm-modal" role="dialog" aria-modal="true">
        <p className="org-eyebrow">Confirm action</p>
        <h2>{target.title}</h2>
        <p>{target.message}</p>
        <div className="org-modal-actions">
          <button
            className="org-button org-button--ghost"
            type="button"
            onClick={onCancel}
            disabled={submitting}
          >
            <X size={17} strokeWidth={1.8} />
            Cancel
          </button>
          <button
            className="org-button org-button--danger"
            type="button"
            onClick={onConfirm}
            disabled={submitting}
          >
            <Trash2 size={17} strokeWidth={1.8} />
            {submitting ? "Working" : "Deactivate"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DepartmentModal({
  mode,
  department,
  departments,
  departmentHeads,
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    name: department?.name || "",
    departmentHead: getId(department?.departmentHead),
    parentDepartment: getId(department?.parentDepartment),
    status: department?.status || "Active",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload =
      mode === "create"
        ? {
            name: form.name.trim(),
            parentDepartment: form.parentDepartment || null,
          }
        : {
            name: form.name.trim(),
            departmentHead: form.departmentHead || null,
            parentDepartment: form.parentDepartment || null,
            status: form.status,
          };

    onSubmit(payload);
  };

  return (
    <div className="org-modal-backdrop" role="presentation">
      <section className="org-modal" role="dialog" aria-modal="true">
        <div className="org-modal-header">
          <div>
            <p className="org-eyebrow">Department modal</p>
            <h2>{mode === "create" ? "Add department" : "Edit department"}</h2>
          </div>
          <button className="org-icon-button" type="button" onClick={onClose}>
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="org-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Department name"
            />
          </label>

          {mode === "edit" && (
            <label>
              <span>Department head</span>
              <div className="org-select-wrap">
                <select
                  value={form.departmentHead}
                  onChange={(event) =>
                    updateField("departmentHead", event.target.value)
                  }
                >
                  <option value="">No department head</option>
                  {departmentHeads.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.email}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={1.8} />
              </div>
            </label>
          )}

          <label>
            <span>Parent department</span>
            <div className="org-select-wrap">
              <select
                value={form.parentDepartment}
                onChange={(event) =>
                  updateField("parentDepartment", event.target.value)
                }
              >
                <option value="">No parent department</option>
                {departments
                  .filter((item) => item._id !== department?._id)
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              <ChevronDown size={17} strokeWidth={1.8} />
            </div>
          </label>

          {mode === "edit" && (
            <label>
              <span>Status</span>
              <div className="org-select-wrap">
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={1.8} />
              </div>
            </label>
          )}

          <div className="org-modal-actions">
            <button
              className="org-button org-button--ghost"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="org-button org-button--primary"
              type="submit"
              disabled={submitting}
            >
              <Check size={17} strokeWidth={1.8} />
              {submitting ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function CategoryModal({ mode, category, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    warrantyPeriod: category?.warrantyPeriod ?? 0,
    status: category?.status || "Active",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload =
      mode === "create"
        ? {
            name: form.name.trim(),
            description: form.description.trim(),
            warrantyPeriod: Number(form.warrantyPeriod || 0),
          }
        : {
            name: form.name.trim(),
            description: form.description.trim(),
            warrantyPeriod: Number(form.warrantyPeriod || 0),
            status: form.status,
          };

    onSubmit(payload);
  };

  return (
    <div className="org-modal-backdrop" role="presentation">
      <section className="org-modal" role="dialog" aria-modal="true">
        <div className="org-modal-header">
          <div>
            <p className="org-eyebrow">Category modal</p>
            <h2>{mode === "create" ? "Add category" : "Edit category"}</h2>
          </div>
          <button className="org-icon-button" type="button" onClick={onClose}>
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="org-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Category name"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Category description"
              rows={4}
            />
          </label>

          <label>
            <span>Warranty period</span>
            <input
              min="0"
              type="number"
              value={form.warrantyPeriod}
              onChange={(event) =>
                updateField("warrantyPeriod", event.target.value)
              }
            />
          </label>

          {mode === "edit" && (
            <label>
              <span>Status</span>
              <div className="org-select-wrap">
                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={1.8} />
              </div>
            </label>
          )}

          <div className="org-modal-actions">
            <button
              className="org-button org-button--ghost"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="org-button org-button--primary"
              type="submit"
              disabled={submitting}
            >
              <Check size={17} strokeWidth={1.8} />
              {submitting ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EmployeeModal({
  employee,
  departments,
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    department: getId(employee?.department),
    status: employee?.status || "Active",
    role:
      employee?.role === "Department Head" || employee?.role === "Asset Manager"
        ? employee.role
        : "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department || null,
      status: form.status,
      role: form.role,
      departmentId: form.department || null,
    });
  };

  return (
    <div className="org-modal-backdrop" role="presentation">
      <section className="org-modal" role="dialog" aria-modal="true">
        <div className="org-modal-header">
          <div>
            <p className="org-eyebrow">Employee modal</p>
            <h2>Edit employee</h2>
          </div>
          <button className="org-icon-button" type="button" onClick={onClose}>
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        <form className="org-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Employee name"
            />
          </label>

          <label>
            <span>Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@company.com"
            />
          </label>

          <label>
            <span>Department</span>
            <div className="org-select-wrap">
              <select
                value={form.department}
                onChange={(event) => updateField("department", event.target.value)}
              >
                <option value="">No department</option>
                {departments
                  .filter((department) => department.status === "Active")
                  .map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
              </select>
              <ChevronDown size={17} strokeWidth={1.8} />
            </div>
          </label>

          <label>
            <span>Status</span>
            <div className="org-select-wrap">
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown size={17} strokeWidth={1.8} />
            </div>
          </label>

          <label>
            <span>Supported role assignment</span>
            <div className="org-select-wrap">
              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              >
                <option value="">Keep current role: {employee.role}</option>
                {EMPLOYEE_PROMOTION_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <ChevronDown size={17} strokeWidth={1.8} />
            </div>
          </label>

          <div className="org-modal-actions">
            <button
              className="org-button org-button--ghost"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="org-button org-button--primary"
              type="submit"
              disabled={submitting}
            >
              <Check size={17} strokeWidth={1.8} />
              {submitting ? "Saving" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const departmentHeads = useMemo(
    () => employees.filter((employee) => employee.role === "Department Head"),
    [employees]
  );

  const filteredDepartments = useMemo(
    () =>
      departments.filter((department) =>
        matchesSearch(department, search, [
          (item) => item.name,
          (item) => getName(item.departmentHead),
          (item) => getName(item.parentDepartment),
          (item) => item.status,
        ])
      ),
    [departments, search]
  );

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        matchesSearch(category, search, [
          (item) => item.name,
          (item) => item.description,
          (item) => item.status,
        ])
      ),
    [categories, search]
  );

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        matchesSearch(employee, search, [
          (item) => item.name,
          (item) => item.email,
          (item) => item.role,
          (item) => getName(item.department),
          (item) => item.status,
        ])
      ),
    [employees, search]
  );

  const activeCount = {
    departments: filteredDepartments.length,
    categories: filteredCategories.length,
    employees: filteredEmployees.length,
  }[activeTab];

  const loadOrganization = async () => {
    setLoading(true);

    try {
      const [departmentResponse, categoryResponse, employeeResponse] =
        await Promise.all([
          authClient.get("/departments", { params: { status: "All" } }),
          authClient.get("/categories", { params: { status: "All" } }),
          authClient.get("/employees", { params: { status: "All" } }),
        ]);

      setDepartments(departmentResponse.data.departments || []);
      setCategories(categoryResponse.data.categories || []);
      setEmployees(employeeResponse.data.employees || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to load organization data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, []);

  const closeModal = () => {
    if (!submitting) setModal(null);
  };

  const handleDepartmentSubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (modal.mode === "create") {
        await authClient.post("/departments", payload);
        toast.success("Department created");
      } else {
        await authClient.put(`/departments/${modal.item._id}`, payload);
        toast.success("Department updated");
      }

      setModal(null);
      await loadOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (payload) => {
    setSubmitting(true);

    try {
      if (modal.mode === "create") {
        await authClient.post("/categories", payload);
        toast.success("Category created");
      } else {
        await authClient.put(`/categories/${modal.item._id}`, payload);
        toast.success("Category updated");
      }

      setModal(null);
      await loadOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployeeSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const { role, departmentId, ...employeePayload } = payload;

      await authClient.put(`/employees/${modal.item._id}`, employeePayload);

      if (role) {
        await authClient.put(`/employees/promote/${modal.item._id}`, {
          role,
          departmentId,
        });
      }

      toast.success("Employee updated");
      setModal(null);
      await loadOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (type, item) => {
    const label = type.slice(0, -1);
    setConfirmation({
      type,
      item,
      title: `Deactivate ${label}`,
      message: `${item.name} will be marked inactive and remain in system history.`,
    });
  };

  const confirmDeactivate = async () => {
    setSubmitting(true);

    try {
      await authClient.delete(`/${confirmation.type}/${confirmation.item._id}`);
      toast.success("Record deactivated");
      setConfirmation(null);
      await loadOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setModal({
      type: activeTab,
      mode: "create",
      item: null,
    });
  };

  const renderDepartments = () => (
    <table className="org-table">
      <thead>
        <tr>
          <th>Department</th>
          <th>Head</th>
          <th>Parent</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredDepartments.map((department) => (
          <tr key={department._id}>
            <td>
              <strong>{department.name}</strong>
            </td>
            <td>{getName(department.departmentHead)}</td>
            <td>{getName(department.parentDepartment)}</td>
            <td>
              <StatusBadge status={department.status} />
            </td>
            <td>
              <div className="org-row-actions">
                <button
                  className="org-icon-button"
                  type="button"
                  onClick={() =>
                    setModal({
                      type: "departments",
                      mode: "edit",
                      item: department,
                    })
                  }
                >
                  <Pencil size={17} strokeWidth={1.8} />
                </button>
                <button
                  className="org-icon-button org-icon-button--danger"
                  type="button"
                  onClick={() => requestDeactivate("departments", department)}
                >
                  <Trash2 size={17} strokeWidth={1.8} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCategories = () => (
    <table className="org-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Description</th>
          <th>Warranty</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredCategories.map((category) => (
          <tr key={category._id}>
            <td>
              <strong>{category.name}</strong>
            </td>
            <td>{category.description || "-"}</td>
            <td>{Number(category.warrantyPeriod || 0)} months</td>
            <td>
              <StatusBadge status={category.status} />
            </td>
            <td>
              <div className="org-row-actions">
                <button
                  className="org-icon-button"
                  type="button"
                  onClick={() =>
                    setModal({
                      type: "categories",
                      mode: "edit",
                      item: category,
                    })
                  }
                >
                  <Pencil size={17} strokeWidth={1.8} />
                </button>
                <button
                  className="org-icon-button org-icon-button--danger"
                  type="button"
                  onClick={() => requestDeactivate("categories", category)}
                >
                  <Trash2 size={17} strokeWidth={1.8} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderEmployees = () => (
    <table className="org-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Email</th>
          <th>Role</th>
          <th>Department</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredEmployees.map((employee) => (
          <tr key={employee._id}>
            <td>
              <strong>{employee.name}</strong>
            </td>
            <td>{employee.email}</td>
            <td>{employee.role}</td>
            <td>{getName(employee.department)}</td>
            <td>
              <StatusBadge status={employee.status} />
            </td>
            <td>
              <div className="org-row-actions">
                <button
                  className="org-icon-button"
                  type="button"
                  onClick={() =>
                    setModal({
                      type: "employees",
                      mode: "edit",
                      item: employee,
                    })
                  }
                >
                  <Pencil size={17} strokeWidth={1.8} />
                </button>
                <button
                  className="org-icon-button org-icon-button--danger"
                  type="button"
                  onClick={() => requestDeactivate("employees", employee)}
                >
                  <Trash2 size={17} strokeWidth={1.8} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderModal = () => {
    if (!modal) return null;

    if (modal.type === "departments") {
      return (
        <DepartmentModal
          mode={modal.mode}
          department={modal.item}
          departments={departments}
          departmentHeads={departmentHeads}
          onClose={closeModal}
          onSubmit={handleDepartmentSubmit}
          submitting={submitting}
        />
      );
    }

    if (modal.type === "categories") {
      return (
        <CategoryModal
          mode={modal.mode}
          category={modal.item}
          onClose={closeModal}
          onSubmit={handleCategorySubmit}
          submitting={submitting}
        />
      );
    }

    return (
      <EmployeeModal
        employee={modal.item}
        departments={departments}
        onClose={closeModal}
        onSubmit={handleEmployeeSubmit}
        submitting={submitting}
      />
    );
  };

  return (
    <main className="org-page">
      <section className="org-hero">
        <div>
          <p className="org-eyebrow">Admin workspace</p>
          <h1>Organization Setup</h1>
        </div>
        <BriefcaseBusiness size={42} strokeWidth={1.6} />
      </section>

      <section className="org-toolbar">
        <div className="org-tabs" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={`org-tab ${activeTab === tab.key ? "is-active" : ""}`}
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearch("");
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="org-search">
          <Search size={18} strokeWidth={1.8} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${activeTab}`}
          />
        </div>

        {activeTab !== "employees" && (
          <button
            className="org-button org-button--primary"
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={17} strokeWidth={1.8} />
            Add
          </button>
        )}
      </section>

      <section className="org-table-panel">
        <div className="org-table-meta">
          <span>{activeCount} records</span>
          <span>Showing {activeTab}</span>
        </div>

        {loading ? (
          <div className="org-empty">Loading organization data</div>
        ) : (
          <div className="org-table-scroll">
            {activeTab === "departments" && renderDepartments()}
            {activeTab === "categories" && renderCategories()}
            {activeTab === "employees" && renderEmployees()}
          </div>
        )}

        {!loading && activeCount === 0 && (
          <div className="org-empty">No records match your search</div>
        )}
      </section>

      {renderModal()}

      <ConfirmationModal
        target={confirmation}
        submitting={submitting}
        onCancel={() => {
          if (!submitting) setConfirmation(null);
        }}
        onConfirm={confirmDeactivate}
      />
    </main>
  );
}
