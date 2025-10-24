import { Address } from "../database/models/Address.js";

// Add Address
export const addAddress = async (req, res) => {
    try {
        const { fullName, address, city, state, country, pincode, phoneNumber } = req.body;
        const userId = req.user;

        // Validation
        if (!fullName || !address || !city || !state || !country || !pincode || !phoneNumber) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        // Validate phone number (basic check)
        if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
            return res.status(400).json({
                message: "Invalid phone number",
                success: false
            });
        }

        // Validate pincode
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: "Invalid pincode (must be 6 digits)",
                success: false
            });
        }

        const userAddress = await Address.create({
            userId,
            fullName,
            address,
            city,
            state,
            country,
            pincode,
            phoneNumber,
        });

        res.status(201).json({
            message: "Address added successfully",
            address: userAddress,
            success: true
        });
    } catch (error) {
        console.error("Add address error:", error);
        res.status(500).json({
            message: "Failed to add address",
            error: error.message,
            success: false
        });
    }
};

// Get Latest Address (Most Recent)
export const getAddress = async (req, res) => {
    try {
        const userId = req.user;

        const address = await Address.findOne({ userId })
            .sort({ createdAt: -1 })
            .lean();

        if (!address) {
            return res.status(404).json({
                message: "No address found",
                address: null,
                success: false
            });
        }

        res.status(200).json({
            message: "Address retrieved successfully",
            address,
            success: true
        });
    } catch (error) {
        console.error("Get address error:", error);
        res.status(500).json({
            message: "Failed to retrieve address",
            error: error.message,
            success: false
        });
    }
};

// Get All Addresses for User
export const getAllAddresses = async (req, res) => {
    try {
        const userId = req.user;

        const addresses = await Address.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: "Addresses retrieved successfully",
            addresses,
            count: addresses.length,
            success: true
        });
    } catch (error) {
        console.error("Get all addresses error:", error);
        res.status(500).json({
            message: "Failed to retrieve addresses",
            error: error.message,
            success: false
        });
    }
};

// Update Address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user;
        const updates = req.body;

        // Validate phone number if provided
        if (updates.phoneNumber && !/^\d{10}$/.test(updates.phoneNumber.replace(/\D/g, ''))) {
            return res.status(400).json({
                message: "Invalid phone number",
                success: false
            });
        }

        // Validate pincode if provided
        if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
            return res.status(400).json({
                message: "Invalid pincode (must be 6 digits)",
                success: false
            });
        }

        const address = await Address.findOneAndUpdate(
            { _id: id, userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!address) {
            return res.status(404).json({
                message: "Address not found or unauthorized",
                success: false
            });
        }

        res.status(200).json({
            message: "Address updated successfully",
            address,
            success: true
        });
    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({
            message: "Failed to update address",
            error: error.message,
            success: false
        });
    }
};

// Delete Address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user;

        const address = await Address.findOneAndDelete({ _id: id, userId });

        if (!address) {
            return res.status(404).json({
                message: "Address not found or unauthorized",
                success: false
            });
        }

        res.status(200).json({
            message: "Address deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Delete address error:", error);
        res.status(500).json({
            message: "Failed to delete address",
            error: error.message,
            success: false
        });
    }
};