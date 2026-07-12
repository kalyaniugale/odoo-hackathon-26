import asyncHandler from "express-async-handler";

import Category from "../models/Category.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, warrantyPeriod } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Category name is required");
    }

    const exists = await Category.findOne({ name });

    if (exists) {
        res.status(400);
        throw new Error("Category already exists");
    }

    const category = await Category.create({
        name,
        description,
        warrantyPeriod,
    });

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
    });
});

export const getCategories = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter =
        status && status !== "All"
            ? { status }
            : status === "All"
            ? {}
            : { status: "Active" };

    const categories = await Category.find(filter).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        count: categories.length,
        categories,
    });
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category || category.status === "Inactive") {
        res.status(404);
        throw new Error("Category not found");
    }

    res.status(200).json({
        success: true,
        category,
    });
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { name, description, warrantyPeriod, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;
    category.warrantyPeriod =
        warrantyPeriod ?? category.warrantyPeriod;
    category.status = status ?? category.status;

    await category.save();

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
    });
});

export const deactivateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    category.status = "Inactive";

    await category.save();

    res.status(200).json({
        success: true,
        message: "Category deactivated successfully",
    });
});