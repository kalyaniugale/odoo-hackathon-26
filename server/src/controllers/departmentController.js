import Department from "../models/Department.js";

// GET /api/departments
// Get all active departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      isActive: true,
    })
      .populate("departmentHead", "name email")
      .populate("parentDepartment", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

// GET /api/departments/:id
// Get a single department
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      isActive: true,
    })
      .populate("departmentHead", "name email")
      .populate("parentDepartment", "name");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch department",
      error: error.message,
    });
  }
};

// POST /api/departments
// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      departmentHead,
      parentDepartment,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    const existingDepartment = await Department.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department name or code already exists",
      });
    }

    if (parentDepartment) {
      const parentExists = await Department.findOne({
        _id: parentDepartment,
        isActive: true,
      });

      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: "Parent department not found",
        });
      }
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description?.trim() || "",
      departmentHead: departmentHead || null,
      parentDepartment: parentDepartment || null,
      isActive: true,
    });

    const populatedDepartment = await Department.findById(department._id)
      .populate("departmentHead", "name email")
      .populate("parentDepartment", "name");

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department: populatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// PUT /api/departments/:id
// Update department information
export const updateDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      departmentHead,
      parentDepartment,
      isActive,
    } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (
      parentDepartment &&
      parentDepartment.toString() === req.params.id
    ) {
      return res.status(400).json({
        success: false,
        message: "Department cannot be its own parent",
      });
    }

    if (parentDepartment) {
      const parentExists = await Department.findOne({
        _id: parentDepartment,
        isActive: true,
      });

      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: "Parent department not found",
        });
      }
    }

    if (name || code) {
      const duplicateDepartment = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name: name.trim() }] : []),
          ...(code
            ? [{ code: code.trim().toUpperCase() }]
            : []),
        ],
      });

      if (duplicateDepartment) {
        return res.status(409).json({
          success: false,
          message: "Department name or code already exists",
        });
      }
    }

    if (name !== undefined) {
      department.name = name.trim();
    }

    if (code !== undefined) {
      department.code = code.trim().toUpperCase();
    }

    if (description !== undefined) {
      department.description = description.trim();
    }

    if (departmentHead !== undefined) {
      department.departmentHead = departmentHead || null;
    }

    if (parentDepartment !== undefined) {
      department.parentDepartment = parentDepartment || null;
    }

    if (isActive !== undefined) {
      department.isActive = isActive;
    }

    await department.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate("departmentHead", "name email")
      .populate("parentDepartment", "name");

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};

// DELETE /api/departments/:id
// Soft delete: deactivate department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (!department.isActive) {
      return res.status(400).json({
        success: false,
        message: "Department is already deactivated",
      });
    }

    department.isActive = false;
    await department.save();

    return res.status(200).json({
      success: true,
      message: "Department deactivated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate department",
      error: error.message,
    });
  }
};