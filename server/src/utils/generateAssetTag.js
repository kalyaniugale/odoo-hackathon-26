import Asset from "../models/Asset.js";

const generateAssetTag = async () => {
    const lastAsset = await Asset.findOne().sort({ createdAt: -1 });

    if (!lastAsset) return "AF-0001";

    const lastNumber = parseInt(lastAsset.assetTag.split("-")[1]);

    return `AF-${String(lastNumber + 1).padStart(4, "0")}`;
};

export default generateAssetTag;